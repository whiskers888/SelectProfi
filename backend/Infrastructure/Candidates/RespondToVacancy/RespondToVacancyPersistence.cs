using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.RespondToVacancy;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.RespondToVacancy;

public sealed class RespondToVacancyPersistence(AppDbContext dbContext) : IRespondToVacancyPersistence
{
    public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null, cancellationToken);
    }

    public Task<User?> FindApplicantByIdAsync(Guid applicantUserId, CancellationToken cancellationToken)
    {
        return dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(user => user.Id == applicantUserId && user.Role == UserRole.Applicant, cancellationToken);
    }

    public Task<Candidate?> FindActiveRegisteredCandidateByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return dbContext.Candidates
            .AsNoTracking()
            .FirstOrDefaultAsync(
                candidate => candidate.UserId == userId
                             && candidate.Source == CandidateSource.RegisteredUser
                             && candidate.DeletedAtUtc == null,
                cancellationToken);
    }

    public Task<bool> VacancyCandidateLinkExistsAsync(Guid vacancyId, Guid candidateId, CancellationToken cancellationToken)
    {
        return dbContext.VacancyCandidates
            .AsNoTracking()
            .AnyAsync(
                vacancyCandidate => vacancyCandidate.VacancyId == vacancyId
                                    && vacancyCandidate.CandidateId == candidateId
                                    && vacancyCandidate.DeletedAtUtc == null,
                cancellationToken);
    }

    public async Task<RespondToVacancyPersistenceResult> CreateAsync(
        Candidate? candidateToCreate,
        VacancyCandidate vacancyCandidate,
        CancellationToken cancellationToken)
    {
        if (candidateToCreate is not null)
            dbContext.Candidates.Add(candidateToCreate);

        dbContext.VacancyCandidates.Add(vacancyCandidate);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return RespondToVacancyPersistenceResult.Created;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return RespondToVacancyPersistenceResult.Conflict;
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

