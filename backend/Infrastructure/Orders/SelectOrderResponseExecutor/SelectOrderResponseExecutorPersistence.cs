using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.SelectOrderResponseExecutor;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.SelectOrderResponseExecutor;

public sealed class SelectOrderResponseExecutorPersistence(AppDbContext dbContext)
    : ISelectOrderResponseExecutorPersistence
{
    public Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Orders.FirstOrDefaultAsync(order => order.Id == orderId, cancellationToken);
    }

    public async Task<IReadOnlyList<OrderExecutorResponse>> FindOrderResponsesAsync(
        Guid orderId,
        CancellationToken cancellationToken)
    {
        return await dbContext.OrderExecutorResponses
            .Where(response => response.OrderId == orderId)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<SelectOrderResponseExecutorPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return SelectOrderResponseExecutorPersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return SelectOrderResponseExecutorPersistenceResult.Conflict;
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
