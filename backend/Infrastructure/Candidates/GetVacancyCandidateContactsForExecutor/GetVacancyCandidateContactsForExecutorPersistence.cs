using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.GetVacancyCandidateContactsForExecutor;

public sealed class GetVacancyCandidateContactsForExecutorPersistence(AppDbContext dbContext)
    : IGetVacancyCandidateContactsForExecutorPersistence
{
    public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null, cancellationToken);
    }

    public Task<VacancyCandidate?> FindActiveVacancyCandidateAsync(
        Guid vacancyId,
        Guid candidateId,
        CancellationToken cancellationToken)
    {
        return dbContext.VacancyCandidates
            .AsNoTracking()
            .Include(vacancyCandidate => vacancyCandidate.Candidate)
            .FirstOrDefaultAsync(
                vacancyCandidate => vacancyCandidate.VacancyId == vacancyId
                                    && vacancyCandidate.CandidateId == candidateId
                                    && vacancyCandidate.DeletedAtUtc == null,
                cancellationToken);
    }
}
