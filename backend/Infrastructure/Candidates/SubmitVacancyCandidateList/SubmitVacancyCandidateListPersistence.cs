using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.SubmitVacancyCandidateList;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.SubmitVacancyCandidateList;

public sealed class SubmitVacancyCandidateListPersistence(AppDbContext dbContext)
    : ISubmitVacancyCandidateListPersistence
{
    public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies
            .Include(vacancy => vacancy.Order)
            .FirstOrDefaultAsync(vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null, cancellationToken);
    }

    public async Task<IReadOnlyList<VacancyCandidate>> FindActiveShortlistCandidatesAsync(
        Guid vacancyId,
        CancellationToken cancellationToken)
    {
        return await dbContext.VacancyCandidates
            .Where(candidate => candidate.VacancyId == vacancyId
                                && candidate.Stage == VacancyCandidateStage.Shortlist
                                && candidate.DeletedAtUtc == null)
            .OrderBy(candidate => candidate.AddedAtUtc)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<SubmitVacancyCandidateListPersistenceResult> SaveChangesAsync(
        CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return SubmitVacancyCandidateListPersistenceResult.Saved;
        }
        catch (DbUpdateConcurrencyException)
        {
            return SubmitVacancyCandidateListPersistenceResult.Conflict;
        }
    }
}
