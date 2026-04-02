using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Domain.Candidates;

public sealed class CandidateResume
{
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; }

    public Guid CandidateId { get; set; }

    [ForeignKey(nameof(CandidateId))]
    public Candidate Candidate { get; set; } = null!;

    public Guid OwnerUserId { get; set; }

    [ForeignKey(nameof(OwnerUserId))]
    public User OwnerUser { get; set; } = null!;

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string ContentJson { get; set; } = "{}";

    public string? AttachmentsJson { get; set; }

    public bool PdfExportAllowed { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public DateTime? DeletedAtUtc { get; set; }
}
