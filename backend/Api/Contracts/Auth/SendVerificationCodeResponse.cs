namespace SelectProfi.backend.Contracts.Auth;

public sealed class SendVerificationCodeResponse
{
    public Guid ChallengeId { get; init; }

    public string Channel { get; init; } = string.Empty;

    public string MaskedTarget { get; init; } = string.Empty;

    public int CodeLength { get; init; }

    public DateTime ExpiresAtUtc { get; init; }

    public DateTime ResendAvailableAtUtc { get; init; }

    public string? DebugCode { get; init; }

    public bool DevelopmentMode { get; init; }
}
