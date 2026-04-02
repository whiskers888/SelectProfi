using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Domain.Candidates;

public sealed class Candidate
{
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public Guid? CreatedByExecutorId { get; set; }

    [ForeignKey(nameof(CreatedByExecutorId))]
    public User? CreatedByExecutor { get; set; }

    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(254)]
    public string? Email { get; set; }

    [MaxLength(32)]
    public string? Phone { get; set; }

    public CandidateSource Source { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public DateTime? DeletedAtUtc { get; set; }

    public ICollection<CandidateResume> Resumes { get; set; } = new List<CandidateResume>();

    public ICollection<VacancyCandidate> VacancyLinks { get; set; } = new List<VacancyCandidate>();
}
