using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.GetMyOrders;

public interface IGetMyOrdersPersistence
{
    Task<IReadOnlyList<Order>> FindMyOrdersAsync(
        Guid executorId,
        bool includeArchived,
        int limit,
        int offset,
        CancellationToken cancellationToken);
}

