using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Register;

public interface ITokenPairIssuer
{
    IssuedTokenPair Issue(User user, DateTime utcNow);
}

public sealed class IssuedTokenPair
{
    public string AccessToken { get; init; } = string.Empty;

    public string RefreshToken { get; init; } = string.Empty;

    public string RefreshTokenHash { get; init; } = string.Empty;

    public DateTime RefreshTokenExpiresAtUtc { get; init; }
}
