using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.UpdateOrder;

public sealed class UpdateOrderPersistence(AppDbContext dbContext) : IUpdateOrderPersistence
{
    public Task<Order?> FindByIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Orders.FirstOrDefaultAsync(order => order.Id == orderId, cancellationToken);
    }

    public Task<bool> ExecutorExistsAsync(Guid executorId, CancellationToken cancellationToken)
    {
        return dbContext.Users.AnyAsync(
            user => user.Id == executorId && user.Role == UserRole.Executor,
            cancellationToken);
    }

    public async Task<UpdateOrderPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return UpdateOrderPersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return UpdateOrderPersistenceResult.Conflict;
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
