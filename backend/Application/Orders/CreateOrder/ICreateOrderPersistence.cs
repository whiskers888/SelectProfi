using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.CreateOrder;

public interface ICreateOrderPersistence
{
    Task<bool> CustomerExistsAsync(Guid customerId, CancellationToken cancellationToken);

    Task<CreateOrderPersistenceResult> CreateAsync(Order order, CancellationToken cancellationToken);
}

public enum CreateOrderPersistenceResult
{
    Created = 0,
    Conflict = 1
}
