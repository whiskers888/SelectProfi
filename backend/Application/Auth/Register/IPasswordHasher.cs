namespace SelectProfi.backend.Application.Auth.Register;

public interface IPasswordHasher
{
    string HashPassword(string password);
}
