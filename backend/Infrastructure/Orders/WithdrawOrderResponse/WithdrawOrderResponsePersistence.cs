using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.WithdrawOrderResponse;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.WithdrawOrderResponse;

public sealed class WithdrawOrderResponsePersistence(AppDbContext dbContext) : IWithdrawOrderResponsePersistence
{
    public Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Orders.FirstOrDefaultAsync(order => order.Id == orderId, cancellationToken);
    }

    public Task<OrderExecutorResponse?> FindExecutorResponseAsync(
        Guid orderId,
        Guid executorId,
        CancellationToken cancellationToken)
    {
        return dbContext.OrderExecutorResponses.FirstOrDefaultAsync(
            response => response.OrderId == orderId && response.ExecutorId == executorId,
            cancellationToken);
    }

    public async Task<WithdrawOrderResponsePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return WithdrawOrderResponsePersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return WithdrawOrderResponsePersistenceResult.Conflict;
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
