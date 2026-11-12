using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Auth;

public sealed class SendVerificationCodeRequest
{
    [EnumDataType(typeof(VerificationChannelContract))]
    public VerificationChannelContract Channel { get; init; }

    [Required]
    [MaxLength(254)]
    public string Target { get; init; } = string.Empty;
}
