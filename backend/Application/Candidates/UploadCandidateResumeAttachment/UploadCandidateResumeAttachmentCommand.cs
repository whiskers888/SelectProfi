using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Candidates.UploadCandidateResumeAttachment;

public sealed class UploadCandidateResumeAttachmentCommand : ICommand<UploadCandidateResumeAttachmentResult>
{
    public Guid VacancyId { get; init; }
    public Guid ResumeId { get; init; }
    public Guid RequesterUserId { get; init; }
    public Stream Content { get; init; } = Stream.Null;
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long Length { get; init; }
}
