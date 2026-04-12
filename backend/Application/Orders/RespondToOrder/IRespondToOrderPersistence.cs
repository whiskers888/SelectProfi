using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.RespondToOrder;

public interface IRespondToOrderPersistence
{
    Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken);

    Task<OrderExecutorResponse?> FindExecutorResponseAsync(
        Guid orderId,
        Guid executorId,
        CancellationToken cancellationToken);

    void Add(OrderExecutorResponse response);

    Task<RespondToOrderPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum RespondToOrderPersistenceResult
{
    Saved = 0,
    Conflict = 1
}
