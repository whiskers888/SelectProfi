using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Application.Auth.Verification;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;

namespace SelectProfi.backend.IntegrationTests.Infrastructure;

public sealed class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AuthFeatureFlags:RequireEmailVerification"] = "false",
                ["AuthFeatureFlags:RequirePhoneVerification"] = "false"
            });
        });
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IRegisterUserPersistence>();
            services.RemoveAll<ILoginUserPersistence>();
            services.RemoveAll<IRefreshAuthSessionPersistence>();
            services.RemoveAll<IProfileReadPersistence>();
            services.RemoveAll<IProfileWritePersistence>();
            services.RemoveAll<IVerificationChallengePersistence>();

            services.AddSingleton<InMemoryAuthStore>();
            services.AddSingleton<InMemoryVerificationChallengeStore>();
            services.AddScoped<IRegisterUserPersistence, InMemoryRegisterUserPersistence>();
            services.AddScoped<ILoginUserPersistence, InMemoryLoginUserPersistence>();
            services.AddScoped<IRefreshAuthSessionPersistence, InMemoryRefreshAuthSessionPersistence>();
            services.AddScoped<IProfileReadPersistence, InMemoryProfileReadPersistence>();
            services.AddScoped<IProfileWritePersistence, InMemoryProfileWritePersistence>();
            services.AddScoped<IVerificationChallengePersistence, InMemoryVerificationChallengePersistence>();

            services.AddControllers()
                .PartManager.ApplicationParts.Add(new AssemblyPart(typeof(TestErrorContractController).Assembly));
        });
    }
}
