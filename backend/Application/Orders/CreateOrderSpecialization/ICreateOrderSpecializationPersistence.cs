using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.CreateOrderSpecialization;

public interface ICreateOrderSpecializationPersistence
{
    Task<CreateOrderSpecializationPersistenceResult> CreateAsync(
        OrderSpecialization specialization,
        CancellationToken cancellationToken);
}

public enum CreateOrderSpecializationPersistenceResult
{
    Created = 0,
    Conflict = 1
}
