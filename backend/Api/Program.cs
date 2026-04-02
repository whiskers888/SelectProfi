using System.Diagnostics;
using FluentValidation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SelectProfi.backend.Application;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Configuration;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure;
using SelectProfi.backend.Infrastructure.Data;
using SelectProfi.backend.Middlewares;
using SelectProfi.backend.Security;

var builder = WebApplication.CreateBuilder(args);
const string clientAppCorsPolicy = "ClientAppCors";

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // @dvnull: Сообщения глобальной валидации переведены на русский, чтобы фронт показывал локализованный текст в алертах.
        options.InvalidModelStateResponseFactory = context =>
        {
            var validationErrors = context.ModelState
                .Where(entry => entry.Value?.Errors.Count > 0)
                .SelectMany(entry => entry.Value!.Errors.Select(error => new
                {
                    field = string.IsNullOrWhiteSpace(entry.Key) ? "request" : entry.Key,
                    message = string.IsNullOrWhiteSpace(error.ErrorMessage) ? "Ошибка валидации." : error.ErrorMessage,
                    code = "invalid"
                }))
                .ToArray();

            var problemDetails = new ProblemDetails
            {
                Type = "https://httpstatuses.com/400",
                Title = "Ошибка валидации",
                Status = StatusCodes.Status400BadRequest,
                Detail = "Произошла одна или несколько ошибок валидации.",
                Instance = context.HttpContext.Request.Path
            };

            problemDetails.Extensions["code"] = "validation_error";
            problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? context.HttpContext.TraceIdentifier;
            problemDetails.Extensions["errors"] = validationErrors;

            return new BadRequestObjectResult(problemDetails)
            {
                ContentTypes = { "application/problem+json" }
            };
        };
    });
builder.Services.AddOptions<PostgresOptions>()
    .Bind(builder.Configuration.GetSection(PostgresOptions.SectionName));
builder.Services.AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.AddOptions<AuthFeatureFlagsOptions>()
    .Bind(builder.Configuration.GetSection(AuthFeatureFlagsOptions.SectionName));
builder.Services.AddScoped<IValidator<PostgresOptions>, PostgresOptionsValidator>();
// @dvnull: Проверка корректности claims перенесена в authentication handler; доп. accessor/filter больше не требуются.
builder.Services.AddApplicationLayer();
builder.Services.AddInfrastructureLayer();
var allowedCorsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy(clientAppCorsPolicy, policy =>
    {
        if (allowedCorsOrigins.Length == 0)
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
            return;
        }

        policy.WithOrigins(allowedCorsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services
    .AddAuthentication("Bearer")
    .AddScheme<AuthenticationSchemeOptions, SimpleJwtAuthenticationHandler>("Bearer", _ => { });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(
        AuthorizationPolicies.CustomerOnly,
        policy => policy.RequireRole(nameof(UserRole.Customer)));
    options.AddPolicy(
        AuthorizationPolicies.ExecutorOnly,
        policy => policy.RequireRole(nameof(UserRole.Executor)));
    options.AddPolicy(
        AuthorizationPolicies.CustomerOrAdmin,
        policy => policy.RequireRole(nameof(UserRole.Customer), nameof(UserRole.Admin)));
    options.AddPolicy(
        AuthorizationPolicies.CustomerAdminExecutor,
        policy => policy.RequireRole(nameof(UserRole.Customer), nameof(UserRole.Admin), nameof(UserRole.Executor)));
});

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var postgresOptions = scope.ServiceProvider.GetRequiredService<IOptions<PostgresOptions>>().Value;
    var validator = scope.ServiceProvider.GetRequiredService<IValidator<PostgresOptions>>();
    var validationResult = validator.Validate(postgresOptions);

    if (!validationResult.IsValid)
        throw new InvalidOperationException(string.Join("; ", validationResult.Errors.Select(error => error.ErrorMessage)));
}
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();
}
if (app.Environment.IsDevelopment())
{
    await SeedDevelopmentUsersAsync(app.Services);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
app.UseCors(clientAppCorsPolicy);
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

static async Task SeedDevelopmentUsersAsync(IServiceProvider services)
{
    using var scope = services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var passwordHashingService = scope.ServiceProvider.GetRequiredService<IPasswordHashingService>();

    var seedUsers = new[]
    {
        new DevelopmentUserSeed("executor@selectprofi.local", "Test", "Executor", UserRole.Executor),
        new DevelopmentUserSeed("customer@selectprofi.local", "Test", "Customer", UserRole.Customer)
    };

    foreach (var seedUser in seedUsers)
    {
        var normalizedEmail = seedUser.Email.Trim().ToUpperInvariant();
        var existingUser = await dbContext.Users.FirstOrDefaultAsync(user => user.NormalizedEmail == normalizedEmail);

        if (existingUser is null)
        {
            dbContext.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Email = seedUser.Email,
                NormalizedEmail = normalizedEmail,
                Phone = null,
                NormalizedPhone = null,
                PasswordHash = passwordHashingService.HashPassword("1"),
                FirstName = seedUser.FirstName,
                LastName = seedUser.LastName,
                Role = seedUser.Role,
                IsEmailVerified = true,
                IsPhoneVerified = true,
                CreatedAtUtc = DateTime.UtcNow
            });

            continue;
        }

        existingUser.Email = seedUser.Email;
        existingUser.NormalizedEmail = normalizedEmail;
        existingUser.FirstName = seedUser.FirstName;
        existingUser.LastName = seedUser.LastName;
        existingUser.Role = seedUser.Role;
        existingUser.IsEmailVerified = true;
        existingUser.IsPhoneVerified = true;

        if (!passwordHashingService.VerifyPassword("1", existingUser.PasswordHash))
            existingUser.PasswordHash = passwordHashingService.HashPassword("1");
    }

    await dbContext.SaveChangesAsync();
}

readonly record struct DevelopmentUserSeed(string Email, string FirstName, string LastName, UserRole Role);

public partial class Program;
