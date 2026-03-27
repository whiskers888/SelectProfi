using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Auth;

public sealed class RegisterUserRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,128}$")]
    public string Password { get; init; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; init; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; init; } = string.Empty;

    [RegularExpression(@"^\+[1-9]\d{9,14}$")]
    public string? Phone { get; init; }

    [Required]
    [EnumDataType(typeof(RegisterUserRole))]
    public RegisterUserRole Role { get; init; }
}
