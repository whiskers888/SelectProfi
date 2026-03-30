namespace SelectProfi.backend.Application.Auth.Refresh;

public interface IRefreshTokenHasher
{
    string HashRefreshToken(string refreshToken);
}
