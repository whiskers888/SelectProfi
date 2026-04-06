using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class CreateCandidateResumeRequest
{
    [Required]
    [MinLength(1)]
    [MaxLength(200)]
    public string FullName { get; init; } = string.Empty;

    public DateOnly? BirthDate { get; init; }

    [EmailAddress]
    [MaxLength(254)]
    public string? Email { get; init; }

    [MaxLength(32)]
    public string? Phone { get; init; }

    [Required]
    [MinLength(1)]
    [MaxLength(120)]
    public string Specialization { get; init; } = string.Empty;

    [Required]
    [MinLength(1)]
    [MaxLength(200)]
    public string ResumeTitle { get; init; } = string.Empty;

    [Required]
    [MinLength(1)]
    public string ResumeContentJson { get; init; } = "{}";

    public string? ResumeAttachmentsJson { get; init; }
}
