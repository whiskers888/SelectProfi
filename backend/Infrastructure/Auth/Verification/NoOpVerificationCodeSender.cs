using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SelectProfi.backend.Application.Auth.Verification;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Infrastructure.Auth.Verification;

public sealed class NoOpVerificationCodeSender(
    IHostEnvironment hostEnvironment,
    ILogger<NoOpVerificationCodeSender> logger) : IVerificationCodeSender
{
    public Task SendAsync(
        VerificationChannel channel,
        string target,
        string code,
        CancellationToken cancellationToken)
    {
        if (hostEnvironment.IsDevelopment())
            logger.LogInformation(
                "Verification code for {Channel} target {Target} was generated and is available through the development-only debug field.",
                channel,
                target);

        return Task.CompletedTask;
    }
}
