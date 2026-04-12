using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.WithdrawOrderResponse;

public interface IWithdrawOrderResponsePersistence
{
    Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken);

    Task<OrderExecutorResponse?> FindExecutorResponseAsync(
        Guid orderId,
        Guid executorId,
        CancellationToken cancellationToken);

    Task<WithdrawOrderResponsePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum WithdrawOrderResponsePersistenceResult
{
    Saved = 0,
    Conflict = 1
}
