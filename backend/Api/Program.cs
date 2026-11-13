using System.Diagnostics;
using FluentValidation;
using Infrastructure;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SelectProfi.backend.Application;
using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Configuration;
using SelectProfi.backend.Domain.Notifications;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Wallets;
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
builder.Services.AddOptions<OrderCandidateRequirementsOptions>()
    .Bind(builder.Configuration.GetSection(OrderCandidateRequirementsOptions.SectionName));
builder.Services.AddOptions<OrderPricingOptions>()
    .Bind(builder.Configuration.GetSection(OrderPricingOptions.SectionName));
builder.Services.AddScoped<IValidator<PostgresOptions>, PostgresOptionsValidator>();
// @dvnull: Ранее минимум кандидатов был захардкожен в бизнес-правиле; теперь читается из appsettings и валидируется при старте.
builder.Services.AddScoped<IValidator<OrderCandidateRequirementsOptions>, OrderCandidateRequirementsOptionsValidator>();
builder.Services.AddScoped<IValidator<OrderPricingOptions>, OrderPricingOptionsValidator>();
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
    // @dvnull: Добавлена policy admin_only для endpoint-ов админ-настройки справочников.
    options.AddPolicy(
        AuthorizationPolicies.AdminOnly,
        policy => policy.RequireRole(nameof(UserRole.Admin)));
    options.AddPolicy(
        AuthorizationPolicies.CustomerOnly,
        policy => policy.RequireRole(nameof(UserRole.Customer)));
    options.AddPolicy(
        AuthorizationPolicies.ExecutorOnly,
        policy => policy.RequireRole(nameof(UserRole.Executor)));
    options.AddPolicy(
        AuthorizationPolicies.ApplicantOnly,
        policy => policy.RequireRole(nameof(UserRole.Applicant)));
    options.AddPolicy(
        AuthorizationPolicies.CustomerOrAdmin,
        policy => policy.RequireRole(nameof(UserRole.Customer), nameof(UserRole.Admin)));
    options.AddPolicy(
        AuthorizationPolicies.CustomerAdminExecutor,
        policy => policy.RequireRole(nameof(UserRole.Customer), nameof(UserRole.Admin), nameof(UserRole.Executor)));
    options.AddPolicy(
        AuthorizationPolicies.CustomerAdminExecutorApplicant,
        policy => policy.RequireRole(
            nameof(UserRole.Customer),
            nameof(UserRole.Admin),
            nameof(UserRole.Executor),
            nameof(UserRole.Applicant)));
});

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
	var postgresOptions = scope.ServiceProvider.GetRequiredService<IOptions<PostgresOptions>>().Value;
	var validator = scope.ServiceProvider.GetRequiredService<IValidator<PostgresOptions>>();
	var validationResult = validator.Validate(postgresOptions);
	var candidateRequirementsOptions = scope.ServiceProvider.GetRequiredService<IOptions<OrderCandidateRequirementsOptions>>().Value;
	var candidateRequirementsValidator = scope.ServiceProvider.GetRequiredService<IValidator<OrderCandidateRequirementsOptions>>();
	var candidateRequirementsValidationResult = candidateRequirementsValidator.Validate(candidateRequirementsOptions);
	var orderPricingOptions = scope.ServiceProvider.GetRequiredService<IOptions<OrderPricingOptions>>().Value;
	var orderPricingValidator = scope.ServiceProvider.GetRequiredService<IValidator<OrderPricingOptions>>();
	var orderPricingValidationResult = orderPricingValidator.Validate(orderPricingOptions);

	var startupValidationErrors = validationResult.Errors
		.Concat(candidateRequirementsValidationResult.Errors)
		.Concat(orderPricingValidationResult.Errors)
		.Select(error => error.ErrorMessage)
		.ToArray();

    if (startupValidationErrors.Length > 0)
        throw new InvalidOperationException(string.Join("; ", startupValidationErrors));
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

    await using var seedTransaction = await dbContext.Database.BeginTransactionAsync();
    await dbContext.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(1397771345, 1)");

    var seedUsers = new[]
    {
        new DevelopmentUserSeed("executor@selectprofi.local", "Test", "Executor", UserRole.Executor),
        new DevelopmentUserSeed("customer@selectprofi.local", "Test", "Customer", UserRole.Customer),
        new DevelopmentUserSeed("applicant@selectprofi.local", "Test", "Applicant", UserRole.Applicant)
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

    var notificationSeeds = new[]
    {
        new DevelopmentNotificationSeed(UserRole.Executor, Guid.Parse("d4b1c501-f4d1-4de0-b001-000000000001"), "Новые отклики", "Проверьте новые отклики по заказам."),
        new DevelopmentNotificationSeed(UserRole.Executor, Guid.Parse("d4b1c501-f4d1-4de0-b001-000000000002"), "Изменён статус заказа", "Один из заказов обновлён."),
        new DevelopmentNotificationSeed(UserRole.Executor, Guid.Parse("d4b1c501-f4d1-4de0-b001-000000000003"), "Напоминание", "Проверьте актуальность профиля."),
        new DevelopmentNotificationSeed(UserRole.Customer, Guid.Parse("d4b1c501-f4d1-4de0-b002-000000000001"), "Новые кандидаты", "В shortlist добавлены кандидаты."),
        new DevelopmentNotificationSeed(UserRole.Customer, Guid.Parse("d4b1c501-f4d1-4de0-b002-000000000002"), "Изменён статус заказа", "Один из заказов обновлён."),
        new DevelopmentNotificationSeed(UserRole.Customer, Guid.Parse("d4b1c501-f4d1-4de0-b002-000000000003"), "Напоминание", "Проверьте актуальность заказа."),
        new DevelopmentNotificationSeed(UserRole.Applicant, Guid.Parse("d4b1c501-f4d1-4de0-b003-000000000001"), "Отклик отправлен", "Ваш отклик сохранён."),
        new DevelopmentNotificationSeed(UserRole.Applicant, Guid.Parse("d4b1c501-f4d1-4de0-b003-000000000002"), "Обновление профиля", "Проверьте актуальность резюме."),
        new DevelopmentNotificationSeed(UserRole.Applicant, Guid.Parse("d4b1c501-f4d1-4de0-b003-000000000003"), "Напоминание", "Проверьте свои отклики.")
    };

    foreach (var seedUser in seedUsers)
    {
        var normalizedEmail = seedUser.Email.Trim().ToUpperInvariant();
        var user = await dbContext.Users.SingleAsync(candidate => candidate.NormalizedEmail == normalizedEmail);
        var nowUtc = DateTime.UtcNow;

        if (!await dbContext.Wallets.AnyAsync(wallet => wallet.UserId == user.Id))
        {
            dbContext.Wallets.Add(new Wallet
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                AvailableBalance = 0m,
                ReservedBalance = 0m,
                CurrencyCode = "RUB",
                CreatedAtUtc = nowUtc,
                UpdatedAtUtc = nowUtc
            });
        }

        foreach (var notificationSeed in notificationSeeds.Where(seed => seed.Role == user.Role))
        {
            if (await dbContext.Notifications.AnyAsync(notification => notification.Id == notificationSeed.Id))
                continue;

            dbContext.Notifications.Add(new Notification
            {
                Id = notificationSeed.Id,
                UserId = user.Id,
                Title = notificationSeed.Title,
                Message = notificationSeed.Message,
                CreatedAtUtc = nowUtc
            });
        }
    }

    await dbContext.SaveChangesAsync();
    await seedTransaction.CommitAsync();
}

readonly record struct DevelopmentUserSeed(string Email, string FirstName, string LastName, UserRole Role);
readonly record struct DevelopmentNotificationSeed(UserRole Role, Guid Id, string Title, string Message);

public partial class Program;
