using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Security;

public sealed class LoginTokenPairIssuerAdapter(ITokenPairFactory tokenPairFactory) : ILoginTokenPairIssuer
{
    public LoginIssuedTokenPair Issue(User user, DateTime utcNow)
    {
        var tokenPair = tokenPairFactory.Create(user, utcNow);

        return new LoginIssuedTokenPair
        {
            AccessToken = tokenPair.AccessToken,
            RefreshToken = tokenPair.RefreshToken,
            RefreshTokenHash = tokenPair.RefreshTokenHash,
            RefreshTokenExpiresAtUtc = tokenPair.RefreshTokenExpiresAtUtc
        };
    }
}
