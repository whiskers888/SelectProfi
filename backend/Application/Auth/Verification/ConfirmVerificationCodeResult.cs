namespace SelectProfi.backend.Application.Auth.Verification;

public sealed class ConfirmVerificationCodeResult
{
    public ConfirmVerificationCodeErrorCode ErrorCode { get; init; } = ConfirmVerificationCodeErrorCode.None;

    public string VerificationToken { get; init; } = string.Empty;

    public string Channel { get; init; } = string.Empty;

    public string Target { get; init; } = string.Empty;

    public DateTime VerifiedAtUtc { get; init; }

    public int RemainingAttempts { get; init; }
}
