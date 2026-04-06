using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.UpdateVacancyCandidateStage;

public sealed class UpdateVacancyCandidateStagePersistence(AppDbContext dbContext)
    : IUpdateVacancyCandidateStagePersistence
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

    public async Task<UpdateVacancyCandidateStagePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return UpdateVacancyCandidateStagePersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return UpdateVacancyCandidateStagePersistenceResult.Conflict;
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
