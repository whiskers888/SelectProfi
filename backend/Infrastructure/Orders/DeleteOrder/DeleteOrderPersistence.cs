using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.DeleteOrder;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.DeleteOrder;

public sealed class DeleteOrderPersistence(AppDbContext dbContext) : IDeleteOrderPersistence
{
    public Task<Order?> FindActiveByIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Orders.FirstOrDefaultAsync(
            order => order.Id == orderId && order.DeletedAtUtc == null,
            cancellationToken);
    }

    public Task<bool> HasActiveVacancyAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies.AnyAsync(
            vacancy => vacancy.OrderId == orderId && vacancy.DeletedAtUtc == null,
            cancellationToken);
    }

    public async Task<DeleteOrderPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return DeleteOrderPersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return DeleteOrderPersistenceResult.Conflict;
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
