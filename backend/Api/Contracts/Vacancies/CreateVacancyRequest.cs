using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class CreateVacancyRequest
{
    [Required]
    public Guid OrderId { get; init; }

    [Required]
    [MinLength(1)]
    [MaxLength(200)]
    public string Title { get; init; } = string.Empty;

    [Required]
    [MinLength(1)]
    [MaxLength(4000)]
    public string Description { get; init; } = string.Empty;
}
