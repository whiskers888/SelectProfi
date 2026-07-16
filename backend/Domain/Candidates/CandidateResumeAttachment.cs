using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SelectProfi.backend.Domain.Candidates;

public sealed class CandidateResumeAttachment
{
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; }

    public Guid CandidateResumeId { get; set; }

    [ForeignKey(nameof(CandidateResumeId))]
    public CandidateResume CandidateResume { get; set; } = null!;

    [MaxLength(255)]
    public string OriginalFileName { get; set; } = string.Empty;

    [MaxLength(255)]
    public string StoredFileName { get; set; } = string.Empty;

    [MaxLength(128)]
    public string ContentType { get; set; } = string.Empty;

    public long Length { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
