using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.SelectOrderResponseExecutor;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.SelectOrderResponseExecutor;

public sealed class SelectOrderResponseExecutorPersistence(AppDbContext dbContext)
    : ISelectOrderResponseExecutorPersistence
{
    public Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Orders.FirstOrDefaultAsync(order => order.Id == orderId, cancellationToken);
    }

    public async Task<IReadOnlyList<OrderExecutorResponse>> FindOrderResponsesAsync(
        Guid orderId,
        CancellationToken cancellationToken)
    {
        return await dbContext.OrderExecutorResponses
            .Where(response => response.OrderId == orderId)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<SelectOrderResponseExecutorPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        foreach (var entry in dbContext.ChangeTracker.Entries<Order>()
                     .Where(entry => entry.State == EntityState.Modified &&
                                     entry.Property(order => order.ExecutorId).IsModified))
        {
            if (entry.Property(order => order.ExecutorId).CurrentValue is not { } executorId ||
                entry.Property(order => order.ExecutorId).OriginalValue == executorId)
                continue;

            dbContext.ProjectActivities.Add(new ProjectActivity
            {
                Id = Guid.NewGuid(),
                OrderId = entry.Entity.Id,
                ActorUserId = entry.Entity.CustomerId,
                Action = "ExecutorAssigned",
                Description = "Исполнитель назначен на проект.",
                CreatedAtUtc = DateTime.UtcNow
            });
        }

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return SelectOrderResponseExecutorPersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return SelectOrderResponseExecutorPersistenceResult.Conflict;
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
