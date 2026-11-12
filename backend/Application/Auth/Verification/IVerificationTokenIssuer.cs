using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Verification;

public interface IVerificationTokenIssuer
{
    string Issue(VerificationChannel channel, string target, DateTime utcNow);

    VerificationTokenPayload? Validate(string token, DateTime utcNow);
}

public sealed record VerificationTokenPayload(VerificationChannel Channel, string Target, DateTime ExpiresAtUtc);
