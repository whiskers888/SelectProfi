using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Refresh;

public sealed class RefreshAuthSessionUseCase(
    IRefreshAuthSessionPersistence persistence,
    IRefreshTokenHasher tokenHasher,
    IRefreshTokenPairIssuer tokenPairIssuer) : IRefreshAuthSessionUseCase
{
    public async Task<RefreshAuthSessionResult> ExecuteAsync(
        RefreshAuthSessionCommand command,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.RefreshToken))
            return new RefreshAuthSessionResult { ErrorCode = RefreshAuthSessionErrorCode.InvalidRefreshToken };

        var utcNow = DateTime.UtcNow;
        var refreshTokenHash = tokenHasher.HashRefreshToken(command.RefreshToken);
        var refreshSession = await persistence.FindByTokenHashAsync(refreshTokenHash, cancellationToken);

        if (refreshSession is null ||
            refreshSession.RevokedAtUtc.HasValue ||
            refreshSession.ExpiresAtUtc <= utcNow)
            return new RefreshAuthSessionResult { ErrorCode = RefreshAuthSessionErrorCode.InvalidRefreshToken };

        var tokens = tokenPairIssuer.Issue(refreshSession.User, utcNow);
        refreshSession.RevokedAtUtc = utcNow;

        var nextSession = new RefreshSession
        {
            Id = Guid.NewGuid(),
            UserId = refreshSession.UserId,
            TokenHash = tokens.RefreshTokenHash,
            ExpiresAtUtc = tokens.RefreshTokenExpiresAtUtc,
            CreatedAtUtc = utcNow
        };

        await persistence.RotateAsync(refreshSession, nextSession, cancellationToken);

        return new RefreshAuthSessionResult
        {
            ErrorCode = RefreshAuthSessionErrorCode.None,
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken
        };
    }
}
