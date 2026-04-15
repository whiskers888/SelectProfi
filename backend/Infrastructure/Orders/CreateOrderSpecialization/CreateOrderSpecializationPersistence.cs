using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.CreateOrderSpecialization;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.CreateOrderSpecialization;

public sealed class CreateOrderSpecializationPersistence(AppDbContext dbContext) : ICreateOrderSpecializationPersistence
{
    public async Task<CreateOrderSpecializationPersistenceResult> CreateAsync(
        OrderSpecialization specialization,
        CancellationToken cancellationToken)
    {
        dbContext.OrderSpecializations.Add(specialization);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return CreateOrderSpecializationPersistenceResult.Created;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return CreateOrderSpecializationPersistenceResult.Conflict;
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
