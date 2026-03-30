using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;
using SelectProfi.backend.HealthChecks;
using SelectProfi.backend.Infrastructure.Auth.Login;
using SelectProfi.backend.Infrastructure.Auth.Refresh;
using SelectProfi.backend.Infrastructure.Auth.Register;
using SelectProfi.backend.Infrastructure.Data;
using SelectProfi.backend.Infrastructure.Profile.GetMyProfile;
using SelectProfi.backend.Infrastructure.Profile.UpdateMyProfile;
using SelectProfi.backend.Security;

namespace SelectProfi.backend.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureLayer(this IServiceCollection services)
    {
        services.AddScoped<IPasswordHashingService, PasswordHashingService>();
        services.AddScoped<ITokenPairFactory, TokenPairFactory>();
        services.AddScoped<IPasswordHasher, RegisterPasswordHasherAdapter>();
        services.AddScoped<ITokenPairIssuer, RegisterTokenPairIssuerAdapter>();
        services.AddScoped<IRegisterUserPersistence, RegisterUserPersistence>();
        services.AddScoped<ILoginPasswordVerifier, LoginPasswordVerifierAdapter>();
        services.AddScoped<ILoginTokenPairIssuer, LoginTokenPairIssuerAdapter>();
        services.AddScoped<ILoginUserPersistence, LoginUserPersistence>();
        services.AddScoped<IRefreshTokenHasher, RefreshTokenHasherAdapter>();
        services.AddScoped<IRefreshTokenPairIssuer, RefreshTokenPairIssuerAdapter>();
        services.AddScoped<IRefreshAuthSessionPersistence, RefreshAuthSessionPersistence>();
        services.AddScoped<IProfileReadPersistence, ProfileReadPersistence>();
        services.AddScoped<IProfileWritePersistence, ProfileWritePersistence>();
        services.AddDbContext<AppDbContext>((serviceProvider, options) =>
        {
            var configuration = serviceProvider.GetRequiredService<IConfiguration>();
            var connectionString = configuration.GetConnectionString("Postgres");
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsAssembly("Infrastructure"));
        });
        services.AddHealthChecks()
            .AddCheck<PostgresDependencyHealthCheck>("postgres", tags: ["dependencies"])
            .AddCheck<RedisDependencyHealthCheck>("redis", tags: ["dependencies"])
            .AddCheck<RabbitMqDependencyHealthCheck>("rabbitmq", tags: ["dependencies"]);
        return services;
    }
}
