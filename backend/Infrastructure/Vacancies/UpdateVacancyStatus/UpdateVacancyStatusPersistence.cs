using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Vacancies.UpdateVacancyStatus;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Vacancies.UpdateVacancyStatus;

public sealed class UpdateVacancyStatusPersistence(AppDbContext dbContext) : IUpdateVacancyStatusPersistence
{
    public Task<Vacancy?> FindActiveByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies.FirstOrDefaultAsync(
            vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null,
            cancellationToken);
    }

    public async Task<UpdateVacancyStatusPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return UpdateVacancyStatusPersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return UpdateVacancyStatusPersistenceResult.Conflict;
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
