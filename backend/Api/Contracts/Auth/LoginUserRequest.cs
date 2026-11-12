using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Auth;

public sealed class LoginUserRequest
{
    [EmailAddress]
    [MaxLength(254)]
    public string? Email { get; init; }

    [RegularExpression(@"^\+[1-9]\d{9,14}$")]
    public string? Phone { get; init; }

    [Required]
    public string Password { get; init; } = string.Empty;
}
