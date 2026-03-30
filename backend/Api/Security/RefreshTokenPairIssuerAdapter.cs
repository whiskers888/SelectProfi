using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Security;

public sealed class RefreshTokenPairIssuerAdapter(ITokenPairFactory tokenPairFactory) : IRefreshTokenPairIssuer
{
    public RefreshIssuedTokenPair Issue(User user, DateTime utcNow)
    {
        var tokenPair = tokenPairFactory.Create(user, utcNow);

        return new RefreshIssuedTokenPair
        {
            AccessToken = tokenPair.AccessToken,
            RefreshToken = tokenPair.RefreshToken,
            RefreshTokenHash = tokenPair.RefreshTokenHash,
            RefreshTokenExpiresAtUtc = tokenPair.RefreshTokenExpiresAtUtc
        };
    }
}
