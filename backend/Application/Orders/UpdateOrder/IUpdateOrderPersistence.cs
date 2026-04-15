using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.UpdateOrder;

public interface IUpdateOrderPersistence
{
    Task<Order?> FindByIdAsync(Guid orderId, CancellationToken cancellationToken);
    // @dvnull: Ранее update-flow не валидировал specializationId по справочнику; добавлен lookup активной специализации.
    Task<UpdateOrderSpecializationSnapshot?> FindActiveSpecializationByIdAsync(Guid specializationId, CancellationToken cancellationToken);

    Task<bool> ExecutorExistsAsync(Guid executorId, CancellationToken cancellationToken);

    Task<UpdateOrderPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum UpdateOrderPersistenceResult
{
    Saved = 0,
    Conflict = 1
}

public sealed class UpdateOrderSpecializationSnapshot
{
    public Guid SpecializationId { get; init; }

    public string Name { get; init; } = string.Empty;
}
