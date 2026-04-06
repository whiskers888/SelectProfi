using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class UpdateVacancyStatusRequest
{
    [Required]
    public VacancyStatusContract Status { get; init; } = VacancyStatusContract.Draft;
}
