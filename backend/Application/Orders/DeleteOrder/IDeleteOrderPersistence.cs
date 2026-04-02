using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.DeleteOrder;

public interface IDeleteOrderPersistence
{
    Task<Order?> FindActiveByIdAsync(Guid orderId, CancellationToken cancellationToken);

    Task<bool> HasActiveVacancyAsync(Guid orderId, CancellationToken cancellationToken);

    Task<DeleteOrderPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum DeleteOrderPersistenceResult
{
    Saved = 0,
    Conflict = 1
}
