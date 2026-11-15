using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.GetVacancyBaseCandidates;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.GetVacancyBaseCandidates;

public sealed class GetVacancyBaseCandidatesPersistence(AppDbContext dbContext) : IGetVacancyBaseCandidatesPersistence
{
    public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null, cancellationToken);
    }

    public async Task<IReadOnlyList<Candidate>> FindGlobalBaseCandidatesAsync(
        CancellationToken cancellationToken)
    {
        return await dbContext.Candidates
            .AsNoTracking()
            .Include(candidate => candidate.Resumes
                .Where(resume => resume.DeletedAtUtc == null)
                .OrderByDescending(resume => resume.UpdatedAtUtc)
                .Take(1))
            .Where(candidate => candidate.DeletedAtUtc == null)
            .OrderByDescending(candidate => candidate.UpdatedAtUtc)
            .ToArrayAsync(cancellationToken);
    }
}
