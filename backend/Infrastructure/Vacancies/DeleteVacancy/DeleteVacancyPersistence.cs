using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Vacancies.DeleteVacancy;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Vacancies.DeleteVacancy;

public sealed class DeleteVacancyPersistence(AppDbContext dbContext) : IDeleteVacancyPersistence
{
    public Task<Vacancy?> FindActiveByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies.FirstOrDefaultAsync(
            vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null,
            cancellationToken);
    }

    public async Task<DeleteVacancyPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return DeleteVacancyPersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return DeleteVacancyPersistenceResult.Conflict;
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
