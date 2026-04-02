using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Vacancies.UpdateVacancy;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Vacancies.UpdateVacancy;

public sealed class UpdateVacancyPersistence(AppDbContext dbContext) : IUpdateVacancyPersistence
{
    public Task<Vacancy?> FindActiveByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies.FirstOrDefaultAsync(
            vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null,
            cancellationToken);
    }

    public async Task<UpdateVacancyPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return UpdateVacancyPersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return UpdateVacancyPersistenceResult.Conflict;
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
