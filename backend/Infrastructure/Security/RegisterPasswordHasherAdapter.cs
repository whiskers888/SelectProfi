using SelectProfi.backend.Application.Auth.Register;

namespace SelectProfi.backend.Security;

public sealed class RegisterPasswordHasherAdapter(IPasswordHashingService passwordHashingService) : IPasswordHasher
{
    public string HashPassword(string password)
    {
        return passwordHashingService.HashPassword(password);
    }
}
