using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Refresh;

public interface IRefreshTokenPairIssuer
{
    RefreshIssuedTokenPair Issue(User user, DateTime utcNow);
}

public sealed class RefreshIssuedTokenPair
{
    public string AccessToken { get; init; } = string.Empty;

    public string RefreshToken { get; init; } = string.Empty;

    public string RefreshTokenHash { get; init; } = string.Empty;

    public DateTime RefreshTokenExpiresAtUtc { get; init; }
}
