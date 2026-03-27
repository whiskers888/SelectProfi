using System.Diagnostics;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SelectProfi.backend.Configuration;
using SelectProfi.backend.HealthChecks;
using SelectProfi.backend.Infrastructure.Data;
using SelectProfi.backend.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var validationErrors = context.ModelState
                .Where(entry => entry.Value?.Errors.Count > 0)
                .SelectMany(entry => entry.Value!.Errors.Select(error => new
                {
                    field = string.IsNullOrWhiteSpace(entry.Key) ? "request" : entry.Key,
                    message = string.IsNullOrWhiteSpace(error.ErrorMessage) ? "Validation error." : error.ErrorMessage,
                    code = "invalid"
                }))
                .ToArray();

            var problemDetails = new ProblemDetails
            {
                Type = "https://httpstatuses.com/400",
                Title = "Validation failed",
                Status = StatusCodes.Status400BadRequest,
                Detail = "One or more validation errors occurred.",
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
builder.Services.AddScoped<IValidator<PostgresOptions>, PostgresOptionsValidator>();
builder.Services.AddDbContext<AppDbContext>((serviceProvider, options) =>
{
    var postgresOptions = serviceProvider.GetRequiredService<IOptions<PostgresOptions>>().Value;
    options.UseNpgsql(postgresOptions.Postgres);
});
builder.Services.AddHealthChecks()
    .AddCheck<PostgresDependencyHealthCheck>("postgres", tags: ["dependencies"])
    .AddCheck<RedisDependencyHealthCheck>("redis", tags: ["dependencies"])
    .AddCheck<RabbitMqDependencyHealthCheck>("rabbitmq", tags: ["dependencies"]);

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var postgresOptions = scope.ServiceProvider.GetRequiredService<IOptions<PostgresOptions>>().Value;
    var validator = scope.ServiceProvider.GetRequiredService<IValidator<PostgresOptions>>();
    var validationResult = validator.Validate(postgresOptions);

    if (!validationResult.IsValid)
        throw new InvalidOperationException(string.Join("; ", validationResult.Errors.Select(error => error.ErrorMessage)));
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.MapControllers();

app.Run();

public partial class Program;
