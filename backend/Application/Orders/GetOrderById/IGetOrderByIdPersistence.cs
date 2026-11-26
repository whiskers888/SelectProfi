using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.GetOrderById;

public interface IGetOrderByIdPersistence
{
    Task<Order?> FindActiveByIdAsync(Guid orderId, CancellationToken cancellationToken);

    Task<bool> HasExecutorRespondedAsync(Guid orderId, Guid executorId, CancellationToken cancellationToken);
}
