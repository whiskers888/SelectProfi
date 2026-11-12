using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Auth.Verification;

public sealed class ConfirmVerificationCodeCommand : ICommand<ConfirmVerificationCodeResult>
{
    public Guid ChallengeId { get; init; }

    public string Code { get; init; } = string.Empty;

    public bool AllowDevelopmentCode { get; init; }
}
