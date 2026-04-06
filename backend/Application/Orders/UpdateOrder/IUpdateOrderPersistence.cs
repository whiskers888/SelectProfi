using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.UpdateOrder;

public interface IUpdateOrderPersistence
{
    Task<Order?> FindActiveByIdAsync(Guid orderId, CancellationToken cancellationToken);

    Task<bool> ExecutorExistsAsync(Guid executorId, CancellationToken cancellationToken);

    Task<UpdateOrderPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum UpdateOrderPersistenceResult
{
    Saved = 0,
    Conflict = 1
}
