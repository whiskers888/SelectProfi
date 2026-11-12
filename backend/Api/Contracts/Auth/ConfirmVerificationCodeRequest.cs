using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Auth;

public sealed class ConfirmVerificationCodeRequest
{
    public Guid ChallengeId { get; init; }

    [Required]
    [RegularExpression(@"^\d{6}$")]
    public string Code { get; init; } = string.Empty;
}
