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

    public async Task<IReadOnlyList<Candidate>> FindAvailableBaseCandidatesAsync(
        Guid vacancyId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Candidates
            .AsNoTracking()
            .Where(candidate => candidate.DeletedAtUtc == null
                                && candidate.Source == CandidateSource.RegisteredUser
                                && candidate.UserId != null
                                && !dbContext.VacancyCandidates.Any(vacancyCandidate =>
                                    vacancyCandidate.VacancyId == vacancyId
                                    && vacancyCandidate.CandidateId == candidate.Id
                                    && vacancyCandidate.DeletedAtUtc == null))
            .OrderByDescending(candidate => candidate.UpdatedAtUtc)
            .ToArrayAsync(cancellationToken);
    }
}
