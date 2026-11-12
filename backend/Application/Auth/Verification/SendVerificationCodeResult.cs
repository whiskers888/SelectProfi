namespace SelectProfi.backend.Application.Auth.Verification;

public sealed class SendVerificationCodeResult
{
    public SendVerificationCodeErrorCode ErrorCode { get; init; } = SendVerificationCodeErrorCode.None;

    public Guid ChallengeId { get; init; }

    public string Channel { get; init; } = string.Empty;

    public string MaskedTarget { get; init; } = string.Empty;

    public int CodeLength { get; init; }

    public DateTime ExpiresAtUtc { get; init; }

    public DateTime ResendAvailableAtUtc { get; init; }

    public string? DebugCode { get; init; }
}
