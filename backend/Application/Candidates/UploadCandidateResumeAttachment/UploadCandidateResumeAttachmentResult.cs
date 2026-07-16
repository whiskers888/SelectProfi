namespace SelectProfi.backend.Application.Candidates.UploadCandidateResumeAttachment;

public sealed class UploadCandidateResumeAttachmentResult
{
    public bool Success { get; init; }
    public Guid AttachmentId { get; init; }
    public string? Error { get; init; }
}
