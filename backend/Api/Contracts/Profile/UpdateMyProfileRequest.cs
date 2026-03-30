using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Profile;

public sealed class UpdateMyProfileRequest
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; init; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; init; } = string.Empty;

    [RegularExpression(@"^\+[1-9]\d{9,14}$")]
    public string? Phone { get; init; }

    public ApplicantProfileUpdateRequest? ApplicantProfile { get; init; }

    public CustomerProfileUpdateRequest? CustomerProfile { get; init; }

    public ExecutorProfileUpdateRequest? ExecutorProfile { get; init; }
}
