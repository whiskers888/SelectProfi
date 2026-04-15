using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.UpdateOrderSpecialization;

public interface IUpdateOrderSpecializationPersistence
{
    Task<OrderSpecialization?> FindByIdAsync(Guid specializationId, CancellationToken cancellationToken);

    Task<UpdateOrderSpecializationPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum UpdateOrderSpecializationPersistenceResult
{
    Saved = 0,
    Conflict = 1
}
