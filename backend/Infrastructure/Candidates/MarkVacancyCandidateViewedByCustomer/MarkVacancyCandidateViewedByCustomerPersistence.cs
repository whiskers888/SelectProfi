using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.MarkVacancyCandidateViewedByCustomer;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.MarkVacancyCandidateViewedByCustomer;

public sealed class MarkVacancyCandidateViewedByCustomerPersistence(AppDbContext dbContext)
    : IMarkVacancyCandidateViewedByCustomerPersistence
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
            .FirstOrDefaultAsync(
                vacancyCandidate => vacancyCandidate.VacancyId == vacancyId
                                    && vacancyCandidate.CandidateId == candidateId
                                    && vacancyCandidate.DeletedAtUtc == null,
                cancellationToken);
    }

    public async Task<MarkVacancyCandidateViewedByCustomerPersistenceResult> SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return MarkVacancyCandidateViewedByCustomerPersistenceResult.Saved;
        }
        catch (DbUpdateException)
        {
            return MarkVacancyCandidateViewedByCustomerPersistenceResult.Conflict;
        }
    }
}
