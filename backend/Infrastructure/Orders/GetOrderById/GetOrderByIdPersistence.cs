using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.GetOrderById;

public sealed class GetOrderByIdPersistence(AppDbContext dbContext) : IGetOrderByIdPersistence
{
    public Task<Order?> FindActiveByIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(order => order.Id == orderId && order.DeletedAtUtc == null, cancellationToken);
    }
}
