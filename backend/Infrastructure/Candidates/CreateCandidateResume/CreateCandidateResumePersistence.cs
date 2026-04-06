using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.CreateCandidateResume;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.CreateCandidateResume;

public sealed class CreateCandidateResumePersistence(AppDbContext dbContext) : ICreateCandidateResumePersistence
{
    public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null, cancellationToken);
    }

    public Task<bool> CandidateIdentityExistsAsync(
        string normalizedFullName,
        DateOnly? birthDate,
        string? normalizedEmail,
        string? normalizedPhone,
        CancellationToken cancellationToken)
    {
        return dbContext.Candidates
            .AsNoTracking()
            .AnyAsync(
                candidate => candidate.DeletedAtUtc == null
                             && ((birthDate.HasValue
                                  && candidate.NormalizedFullName == normalizedFullName
                                  && candidate.BirthDate == birthDate.Value)
                                 || (normalizedEmail != null && candidate.NormalizedEmail == normalizedEmail)
                                 || (normalizedPhone != null && candidate.NormalizedPhone == normalizedPhone)),
                cancellationToken);
    }

    public async Task<CreateCandidateResumePersistenceResult> CreateAsync(
        Candidate candidate,
        CandidateResume resume,
        VacancyCandidate vacancyCandidate,
        CancellationToken cancellationToken)
    {
        dbContext.Candidates.Add(candidate);
        dbContext.CandidateResumes.Add(resume);
        dbContext.VacancyCandidates.Add(vacancyCandidate);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return CreateCandidateResumePersistenceResult.Created;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return CreateCandidateResumePersistenceResult.Conflict;
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
