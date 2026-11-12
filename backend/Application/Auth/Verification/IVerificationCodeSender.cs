using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Verification;

public interface IVerificationCodeSender
{
    Task SendAsync(
        VerificationChannel channel,
        string target,
        string code,
        CancellationToken cancellationToken);
}
