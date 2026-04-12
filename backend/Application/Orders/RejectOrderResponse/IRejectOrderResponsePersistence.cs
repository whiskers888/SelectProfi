using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.RejectOrderResponse;

public interface IRejectOrderResponsePersistence
{
    Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken);

    Task<OrderExecutorResponse?> FindOrderResponseAsync(
        Guid orderId,
        Guid executorId,
        CancellationToken cancellationToken);

    Task<RejectOrderResponsePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum RejectOrderResponsePersistenceResult
{
    Saved = 0,
    Conflict = 1
}
