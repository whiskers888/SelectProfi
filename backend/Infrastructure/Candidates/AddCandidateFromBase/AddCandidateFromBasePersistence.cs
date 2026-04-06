using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.AddCandidateFromBase;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.AddCandidateFromBase;

public sealed class AddCandidateFromBasePersistence(AppDbContext dbContext) : IAddCandidateFromBasePersistence
{
    public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null, cancellationToken);
    }

    public Task<Candidate?> FindRegisteredCandidateByIdAsync(Guid candidateId, CancellationToken cancellationToken)
    {
        return dbContext.Candidates
            .AsNoTracking()
            .FirstOrDefaultAsync(
                candidate => candidate.Id == candidateId
                             && candidate.DeletedAtUtc == null
                             && candidate.Source == CandidateSource.RegisteredUser
                             && candidate.UserId != null,
                cancellationToken);
    }

    public async Task<AddCandidateFromBasePersistenceResult> CreateAsync(
        VacancyCandidate vacancyCandidate,
        CancellationToken cancellationToken)
    {
        dbContext.VacancyCandidates.Add(vacancyCandidate);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return AddCandidateFromBasePersistenceResult.Created;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return AddCandidateFromBasePersistenceResult.Conflict;
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
