using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.CreateOrder;

public interface ICreateOrderPersistence
{
    Task<CreateOrderCustomerSnapshot?> FindCustomerSnapshotAsync(Guid customerId, CancellationToken cancellationToken);
    // @dvnull: Ранее create-flow не валидировал specializationId по справочнику; добавлен lookup активной специализации.
    Task<CreateOrderSpecializationSnapshot?> FindActiveSpecializationByIdAsync(Guid specializationId, CancellationToken cancellationToken);

    Task<CreateOrderPersistenceResult> CreateAsync(Order order, CancellationToken cancellationToken);
}

public sealed class CreateOrderCustomerSnapshot
{
    public Guid CustomerId { get; init; }

    public string? CompanyName { get; init; }
}

public sealed class CreateOrderSpecializationSnapshot
{
    public Guid SpecializationId { get; init; }

    public string Name { get; init; } = string.Empty;
}

public enum CreateOrderPersistenceResult
{
    Created = 0,
    Conflict = 1
}
