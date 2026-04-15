using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.UpdateOrderSpecialization;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.UpdateOrderSpecialization;

public sealed class UpdateOrderSpecializationPersistence(AppDbContext dbContext) : IUpdateOrderSpecializationPersistence
{
    public Task<OrderSpecialization?> FindByIdAsync(Guid specializationId, CancellationToken cancellationToken)
    {
        return dbContext.OrderSpecializations.FirstOrDefaultAsync(item => item.Id == specializationId, cancellationToken);
    }

    public async Task<UpdateOrderSpecializationPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return UpdateOrderSpecializationPersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return UpdateOrderSpecializationPersistenceResult.Conflict;
        }
    }

    private static bool IsUniqueViolation(DbUpdateException exception)
    {
        var innerException = exception.InnerException;
        if (innerException is null)
            return false;

        var sqlStateProperty = innerException.GetType().GetProperty("SqlState");
        var sqlStateValue = sqlStateProperty?.GetValue(innerException) as string;

        return string.Equals(sqlStateValue, "23505", StringComparison.Ordinal);
    }
}
