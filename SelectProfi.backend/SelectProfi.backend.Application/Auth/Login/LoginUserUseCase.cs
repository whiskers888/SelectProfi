using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Login;

public sealed class LoginUserUseCase(
    ILoginUserPersistence persistence,
    ILoginPasswordVerifier passwordVerifier,
    ILoginTokenPairIssuer tokenPairIssuer) : ILoginUserUseCase
{
    public async Task<LoginUserResult> ExecuteAsync(LoginUserCommand command, CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(command.Email);
        var user = await persistence.FindByNormalizedEmailAsync(normalizedEmail, cancellationToken);

        if (user is null || !passwordVerifier.VerifyPassword(command.Password, user.PasswordHash))
            return new LoginUserResult { ErrorCode = LoginUserErrorCode.InvalidCredentials };

        var utcNow = DateTime.UtcNow;
        var tokens = tokenPairIssuer.Issue(user, utcNow);

        var refreshSession = new RefreshSession
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokens.RefreshTokenHash,
            ExpiresAtUtc = tokens.RefreshTokenExpiresAtUtc,
            CreatedAtUtc = utcNow
        };

        await persistence.SaveRefreshSessionAsync(refreshSession, cancellationToken);

        return new LoginUserResult
        {
            ErrorCode = LoginUserErrorCode.None,
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken
        };
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToUpperInvariant();
    }
}
