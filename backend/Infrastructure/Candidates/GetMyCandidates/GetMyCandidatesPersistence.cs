using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.GetMyCandidates;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.GetMyCandidates;

public sealed class GetMyCandidatesPersistence(AppDbContext dbContext) : IGetMyCandidatesPersistence
{
    public async Task<IReadOnlyList<GetMyCandidatesItemResult>> FindByOwnerAsync(Guid executorUserId, CancellationToken cancellationToken) =>
        await dbContext.Candidates
            .AsNoTracking()
            .Where(candidate => candidate.DeletedAtUtc == null &&
                (candidate.CreatedByExecutorId == executorUserId || candidate.ContactsOwnerExecutorId == executorUserId))
            .Select(candidate => new GetMyCandidatesItemResult
            {
                CandidateId = candidate.Id,
                FullName = candidate.FullName,
                SpecializationName = candidate.Resumes
                    .Where(resume => resume.DeletedAtUtc == null)
                    .OrderByDescending(resume => resume.UpdatedAtUtc)
                    .Select(resume => resume.Specialization.Name)
                    .FirstOrDefault() ?? string.Empty,
                ResumeTitle = candidate.Resumes
                    .Where(resume => resume.DeletedAtUtc == null)
                    .OrderByDescending(resume => resume.UpdatedAtUtc)
                    .Select(resume => resume.Title)
                    .FirstOrDefault() ?? string.Empty,
                UpdatedAtUtc = candidate.UpdatedAtUtc
            })
            .OrderByDescending(item => item.UpdatedAtUtc)
            .ToArrayAsync(cancellationToken);
}
