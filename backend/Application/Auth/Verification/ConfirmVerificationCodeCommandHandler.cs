using System.Security.Cryptography;
using System.Text;
using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Auth.Verification;

public sealed class ConfirmVerificationCodeCommandHandler(
    IVerificationChallengePersistence persistence,
    IVerificationTokenIssuer tokenIssuer) : ICommandHandler<ConfirmVerificationCodeCommand, ConfirmVerificationCodeResult>
{
    public const int MaxAttempts = 5;

    public async Task<ConfirmVerificationCodeResult> HandleAsync(
        ConfirmVerificationCodeCommand command,
        CancellationToken cancellationToken)
    {
        var utcNow = DateTime.UtcNow;
        var challenge = await persistence.FindByIdAsync(command.ChallengeId, cancellationToken);

        if (challenge is null || challenge.ConsumedAtUtc is not null || challenge.ExpiresAtUtc <= utcNow)
            return new ConfirmVerificationCodeResult { ErrorCode = ConfirmVerificationCodeErrorCode.ChallengeExpired };

        if (challenge.Attempts >= MaxAttempts)
            return new ConfirmVerificationCodeResult
            {
                ErrorCode = ConfirmVerificationCodeErrorCode.AttemptsExceeded,
                RemainingAttempts = 0
            };

        var submittedCode = command.Code.Trim();
        var isDevelopmentCode =
            command.AllowDevelopmentCode &&
            string.Equals(submittedCode, SendVerificationCodeCommandHandler.DevelopmentCode, StringComparison.Ordinal);

        var submittedHash = VerificationTargets.ComputeCodeHash(submittedCode);
        if (!isDevelopmentCode && !IsCodeMatch(challenge.CodeHash, submittedHash))
        {
            challenge.Attempts++;
            await persistence.UpdateAsync(challenge, cancellationToken);

            var remainingAttempts = Math.Max(MaxAttempts - challenge.Attempts, 0);
            if (remainingAttempts == 0)
                return new ConfirmVerificationCodeResult
                {
                    ErrorCode = ConfirmVerificationCodeErrorCode.AttemptsExceeded,
                    RemainingAttempts = 0
                };

            return new ConfirmVerificationCodeResult
            {
                ErrorCode = ConfirmVerificationCodeErrorCode.InvalidCode,
                RemainingAttempts = remainingAttempts
            };
        }

        challenge.ConsumedAtUtc = utcNow;
        await persistence.UpdateAsync(challenge, cancellationToken);

        return new ConfirmVerificationCodeResult
        {
            ErrorCode = ConfirmVerificationCodeErrorCode.None,
            VerificationToken = tokenIssuer.Issue(challenge.Channel, challenge.Target, utcNow),
            Channel = challenge.Channel.ToString(),
            Target = challenge.Target,
            VerifiedAtUtc = utcNow,
            RemainingAttempts = Math.Max(MaxAttempts - challenge.Attempts, 0)
        };
    }

    private static bool IsCodeMatch(string expectedHash, string submittedHash)
    {
        var expectedBytes = Encoding.UTF8.GetBytes(expectedHash);
        var submittedBytes = Encoding.UTF8.GetBytes(submittedHash);

        return expectedBytes.Length == submittedBytes.Length &&
               CryptographicOperations.FixedTimeEquals(expectedBytes, submittedBytes);
    }
}
