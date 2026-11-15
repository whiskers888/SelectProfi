using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidates;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.GetVacancyCandidates;

public sealed class GetVacancyCandidatesPersistence(AppDbContext dbContext) : IGetVacancyCandidatesPersistence
{
    public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null, cancellationToken);
    }

    public async Task<IReadOnlyList<VacancyCandidate>> FindActiveVacancyCandidatesAsync(
        Guid vacancyId,
        CancellationToken cancellationToken)
    {
        return await dbContext.VacancyCandidates
            .AsNoTracking()
            .Include(vacancyCandidate => vacancyCandidate.Candidate)
            .ThenInclude(candidate => candidate.User)
            .Include(vacancyCandidate => vacancyCandidate.Candidate)
            .ThenInclude(candidate => candidate.Resumes
                .Where(resume => resume.DeletedAtUtc == null)
                .OrderByDescending(resume => resume.UpdatedAtUtc)
                .Take(1))
            .Where(vacancyCandidate => vacancyCandidate.VacancyId == vacancyId && vacancyCandidate.DeletedAtUtc == null)
            .OrderByDescending(vacancyCandidate => vacancyCandidate.UpdatedAtUtc)
            .ToArrayAsync(cancellationToken);
    }
}
