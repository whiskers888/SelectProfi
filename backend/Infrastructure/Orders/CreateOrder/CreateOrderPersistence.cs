using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.CreateOrder;

public sealed class CreateOrderPersistence(AppDbContext dbContext) : ICreateOrderPersistence
{
    public Task<bool> CustomerExistsAsync(Guid customerId, CancellationToken cancellationToken)
    {
        return dbContext.Users.AnyAsync(
            user => user.Id == customerId && user.Role == UserRole.Customer,
            cancellationToken);
    }

    public async Task<CreateOrderPersistenceResult> CreateAsync(Order order, CancellationToken cancellationToken)
    {
        dbContext.Orders.Add(order);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return CreateOrderPersistenceResult.Created;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return CreateOrderPersistenceResult.Conflict;
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
