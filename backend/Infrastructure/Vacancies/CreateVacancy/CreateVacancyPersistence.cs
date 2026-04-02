using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Vacancies.CreateVacancy;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Vacancies.CreateVacancy;

public sealed class CreateVacancyPersistence(AppDbContext dbContext) : ICreateVacancyPersistence
{
    public Task<Order?> FindActiveOrderByIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(order => order.Id == orderId && order.DeletedAtUtc == null, cancellationToken);
    }

    public Task<bool> ActiveVacancyExistsForOrderAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies.AnyAsync(
            vacancy => vacancy.OrderId == orderId && vacancy.DeletedAtUtc == null,
            cancellationToken);
    }

    public async Task<CreateVacancyPersistenceResult> CreateAsync(Vacancy vacancy, CancellationToken cancellationToken)
    {
        dbContext.Vacancies.Add(vacancy);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return CreateVacancyPersistenceResult.Created;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return CreateVacancyPersistenceResult.Conflict;
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
