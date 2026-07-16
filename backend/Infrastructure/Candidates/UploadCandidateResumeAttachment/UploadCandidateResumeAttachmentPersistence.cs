using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.UploadCandidateResumeAttachment;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.UploadCandidateResumeAttachment;

public sealed class UploadCandidateResumeAttachmentPersistence(AppDbContext dbContext) : IUploadCandidateResumeAttachmentPersistence
{
    public Task<bool> CanUploadAsync(Guid vacancyId, Guid resumeId, Guid requesterUserId, CancellationToken cancellationToken) =>
        dbContext.CandidateResumes.AnyAsync(resume =>
            resume.Id == resumeId && resume.DeletedAtUtc == null && resume.OwnerUserId == requesterUserId &&
            dbContext.VacancyCandidates.Any(link => link.VacancyId == vacancyId && link.CandidateId == resume.CandidateId && link.DeletedAtUtc == null), cancellationToken);

    public async Task SaveAsync(CandidateResumeAttachment attachment, CancellationToken cancellationToken)
    {
        dbContext.CandidateResumeAttachments.Add(attachment);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
