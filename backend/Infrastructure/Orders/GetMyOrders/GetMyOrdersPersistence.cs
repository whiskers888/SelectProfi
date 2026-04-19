using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.GetMyOrders;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.GetMyOrders;

public sealed class GetMyOrdersPersistence(AppDbContext dbContext) : IGetMyOrdersPersistence
{
    public async Task<IReadOnlyList<Order>> FindMyOrdersAsync(
        Guid executorId,
        bool includeArchived,
        int limit,
        int offset,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Orders.AsNoTracking();

        if (!includeArchived)
        {
            query = query.Where(order => order.DeletedAtUtc == null);
        }

        query = query.Where(order => order.ExecutorId == executorId);

        return await query
            .OrderByDescending(order => order.CreatedAtUtc)
            .Skip(offset)
            .Take(limit)
            .ToArrayAsync(cancellationToken);
    }
}

