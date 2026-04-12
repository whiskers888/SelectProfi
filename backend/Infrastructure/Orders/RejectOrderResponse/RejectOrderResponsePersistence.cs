using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.RejectOrderResponse;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.RejectOrderResponse;

public sealed class RejectOrderResponsePersistence(AppDbContext dbContext) : IRejectOrderResponsePersistence
{
    public Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Orders.FirstOrDefaultAsync(order => order.Id == orderId, cancellationToken);
    }

    public Task<OrderExecutorResponse?> FindOrderResponseAsync(
        Guid orderId,
        Guid executorId,
        CancellationToken cancellationToken)
    {
        return dbContext.OrderExecutorResponses.FirstOrDefaultAsync(
            response => response.OrderId == orderId && response.ExecutorId == executorId,
            cancellationToken);
    }

    public async Task<RejectOrderResponsePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return RejectOrderResponsePersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return RejectOrderResponsePersistenceResult.Conflict;
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
