using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.RespondToOrder;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.RespondToOrder;

public sealed class RespondToOrderPersistence(AppDbContext dbContext) : IRespondToOrderPersistence
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

    public void Add(OrderExecutorResponse response)
    {
        dbContext.OrderExecutorResponses.Add(response);
    }

    public async Task<RespondToOrderPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return RespondToOrderPersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return RespondToOrderPersistenceResult.Conflict;
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
