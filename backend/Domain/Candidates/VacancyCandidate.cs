using System.ComponentModel.DataAnnotations.Schema;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Domain.Candidates;

public sealed class VacancyCandidate
{
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; }

    public Guid VacancyId { get; set; }

    [ForeignKey(nameof(VacancyId))]
    public Vacancy Vacancy { get; set; } = null!;

    public Guid CandidateId { get; set; }

    [ForeignKey(nameof(CandidateId))]
    public Candidate Candidate { get; set; } = null!;

    public Guid AddedByExecutorId { get; set; }

    [ForeignKey(nameof(AddedByExecutorId))]
    public User AddedByExecutor { get; set; } = null!;

    public VacancyCandidateStage Stage { get; set; }

    public DateTime AddedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public DateTime? ViewedByCustomerAtUtc { get; set; }

    public DateTime? DeletedAtUtc { get; set; }
}
