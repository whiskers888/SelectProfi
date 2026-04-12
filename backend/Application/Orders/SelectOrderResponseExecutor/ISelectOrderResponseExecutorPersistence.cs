using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.SelectOrderResponseExecutor;

public interface ISelectOrderResponseExecutorPersistence
{
    Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken);

    Task<IReadOnlyList<OrderExecutorResponse>> FindOrderResponsesAsync(
        Guid orderId,
        CancellationToken cancellationToken);

    Task<SelectOrderResponseExecutorPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum SelectOrderResponseExecutorPersistenceResult
{
    Saved = 0,
    Conflict = 1
}
