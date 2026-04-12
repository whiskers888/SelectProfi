using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.GetMyOrderResponse;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.GetMyOrderResponse;

public sealed class GetMyOrderResponsePersistence(AppDbContext dbContext) : IGetMyOrderResponsePersistence
{
    public Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Orders.AsNoTracking().FirstOrDefaultAsync(order => order.Id == orderId, cancellationToken);
    }

    public Task<OrderExecutorResponse?> FindExecutorResponseAsync(
        Guid orderId,
        Guid executorId,
        CancellationToken cancellationToken)
    {
        return dbContext.OrderExecutorResponses.AsNoTracking().FirstOrDefaultAsync(
            response => response.OrderId == orderId && response.ExecutorId == executorId,
            cancellationToken);
    }
}
