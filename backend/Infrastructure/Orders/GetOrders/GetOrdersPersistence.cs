using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.GetOrders;

public sealed class GetOrdersPersistence(AppDbContext dbContext) : IGetOrdersPersistence
{
    public async Task<IReadOnlyList<Order>> FindVisibleActiveOrdersAsync(
        Guid requesterUserId,
        UserRole requesterRole,
        int limit,
        int offset,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Orders
            .AsNoTracking()
            .Where(order => order.DeletedAtUtc == null);

        query = requesterRole switch
        {
            UserRole.Admin => query,
            UserRole.Customer => query.Where(order => order.CustomerId == requesterUserId),
            UserRole.Executor => query.Where(order => order.ExecutorId == null || order.ExecutorId == requesterUserId),
            _ => query.Where(_ => false)
        };

        return await query
            .OrderByDescending(order => order.CreatedAtUtc)
            .Skip(offset)
            .Take(limit)
            .ToArrayAsync(cancellationToken);
    }
}
