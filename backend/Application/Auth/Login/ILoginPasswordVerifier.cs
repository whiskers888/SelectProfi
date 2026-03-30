namespace SelectProfi.backend.Application.Auth.Login;

public interface ILoginPasswordVerifier
{
    bool VerifyPassword(string password, string passwordHash);
}
