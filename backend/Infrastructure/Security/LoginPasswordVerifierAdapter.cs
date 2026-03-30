using SelectProfi.backend.Application.Auth.Login;

namespace SelectProfi.backend.Security;

public sealed class LoginPasswordVerifierAdapter(IPasswordHashingService passwordHashingService) : ILoginPasswordVerifier
{
    public bool VerifyPassword(string password, string passwordHash)
    {
        return passwordHashingService.VerifyPassword(password, passwordHash);
    }
}
