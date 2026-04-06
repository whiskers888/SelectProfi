using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class SelectVacancyCandidateRequest
{
    [Required]
    public Guid CandidateId { get; init; }
}
