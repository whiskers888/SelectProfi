using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.CreateOrder;

public interface ICreateOrderPersistence
{
    Task<CreateOrderCustomerSnapshot?> FindCustomerSnapshotAsync(Guid customerId, CancellationToken cancellationToken);

    Task<CreateOrderPersistenceResult> CreateAsync(Order order, CancellationToken cancellationToken);
}

public sealed class CreateOrderCustomerSnapshot
{
    public Guid CustomerId { get; init; }

    public string? CompanyName { get; init; }
}

public enum CreateOrderPersistenceResult
{
    Created = 0,
    Conflict = 1
}
