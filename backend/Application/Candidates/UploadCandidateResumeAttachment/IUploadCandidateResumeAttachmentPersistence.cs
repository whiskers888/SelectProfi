using SelectProfi.backend.Domain.Candidates;

namespace SelectProfi.backend.Application.Candidates.UploadCandidateResumeAttachment;

public interface IUploadCandidateResumeAttachmentPersistence
{
    Task<bool> CanUploadAsync(Guid? vacancyId, Guid resumeId, Guid requesterUserId, CancellationToken cancellationToken);
    Task SaveAsync(CandidateResumeAttachment attachment, CancellationToken cancellationToken);
}
