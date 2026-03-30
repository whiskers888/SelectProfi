using SelectProfi.backend.Application.Auth.Refresh;

namespace SelectProfi.backend.Security;

public sealed class RefreshTokenHasherAdapter(ITokenPairFactory tokenPairFactory) : IRefreshTokenHasher
{
    public string HashRefreshToken(string refreshToken)
    {
        return tokenPairFactory.HashRefreshToken(refreshToken);
    }
}
