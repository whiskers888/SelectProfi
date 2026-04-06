using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.SelectVacancyCandidate;

public sealed class SelectVacancyCandidatePersistence(AppDbContext dbContext) : ISelectVacancyCandidatePersistence
{
    public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies.FirstOrDefaultAsync(
            vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null,
            cancellationToken);
    }

    public Task<bool> CandidateInShortlistAsync(Guid vacancyId, Guid candidateId, CancellationToken cancellationToken)
    {
        return dbContext.VacancyCandidates.AnyAsync(
            vacancyCandidate => vacancyCandidate.VacancyId == vacancyId
                                && vacancyCandidate.CandidateId == candidateId
                                && vacancyCandidate.Stage == VacancyCandidateStage.Shortlist
                                && vacancyCandidate.DeletedAtUtc == null,
            cancellationToken);
    }

    public async Task<SelectVacancyCandidatePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return SelectVacancyCandidatePersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return SelectVacancyCandidatePersistenceResult.Conflict;
        }
    }

    private static bool IsUniqueViolation(DbUpdateException exception)
    {
        var innerException = exception.InnerException;
        if (innerException is null)
            return false;

        var sqlStateProperty = innerException.GetType().GetProperty("SqlState");
        var sqlStateValue = sqlStateProperty?.GetValue(innerException) as string;

        return string.Equals(sqlStateValue, "23505", StringComparison.Ordinal);
    }
}
