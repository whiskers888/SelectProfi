using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.GetMyOrderResponse;

public interface IGetMyOrderResponsePersistence
{
    Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken);

    Task<OrderExecutorResponse?> FindExecutorResponseAsync(
        Guid orderId,
        Guid executorId,
        CancellationToken cancellationToken);
}
