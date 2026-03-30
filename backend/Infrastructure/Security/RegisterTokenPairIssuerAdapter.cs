using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Security;

public sealed class RegisterTokenPairIssuerAdapter(ITokenPairFactory tokenPairFactory) : ITokenPairIssuer
{
    public IssuedTokenPair Issue(User user, DateTime utcNow)
    {
        var tokenPair = tokenPairFactory.Create(user, utcNow);

        return new IssuedTokenPair
        {
            AccessToken = tokenPair.AccessToken,
            RefreshToken = tokenPair.RefreshToken,
            RefreshTokenHash = tokenPair.RefreshTokenHash,
            RefreshTokenExpiresAtUtc = tokenPair.RefreshTokenExpiresAtUtc
        };
    }
}
