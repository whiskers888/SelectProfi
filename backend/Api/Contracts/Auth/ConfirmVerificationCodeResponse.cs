namespace SelectProfi.backend.Contracts.Auth;

public sealed class ConfirmVerificationCodeResponse
{
    public string VerificationToken { get; init; } = string.Empty;

    public string Channel { get; init; } = string.Empty;

    public string Target { get; init; } = string.Empty;

    public DateTime VerifiedAtUtc { get; init; }
}
