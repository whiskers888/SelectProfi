using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.UpdateOrder;

public sealed class UpdateOrderPersistence(AppDbContext dbContext) : IUpdateOrderPersistence
{
    public Task<Order?> FindByIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Orders.FirstOrDefaultAsync(order => order.Id == orderId, cancellationToken);
    }

    public Task<UpdateOrderSpecializationSnapshot?> FindActiveSpecializationByIdAsync(
        Guid specializationId,
        CancellationToken cancellationToken)
    {
        // @dvnull: Ранее update-order persistence не читала справочник специализаций; добавлена выборка активной specialization по Id.
        return dbContext.OrderSpecializations
            .AsNoTracking()
            .Where(item => item.Id == specializationId && item.IsActive)
            .Select(item => new UpdateOrderSpecializationSnapshot
            {
                SpecializationId = item.Id,
                Name = item.Name
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task<bool> ExecutorExistsAsync(Guid executorId, CancellationToken cancellationToken)
    {
        return dbContext.Users.AnyAsync(
            user => user.Id == executorId && user.Role == UserRole.Executor,
            cancellationToken);
    }

    public async Task<UpdateOrderPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        foreach (var entry in dbContext.ChangeTracker.Entries<Order>()
                     .Where(entry => entry.State == EntityState.Modified))
        {
            var previousStatus = entry.Property(order => order.Status).OriginalValue;
            var currentStatus = entry.Property(order => order.Status).CurrentValue;
            if (previousStatus != currentStatus)
            {
                var description = currentStatus switch
                {
                    OrderStatus.Paused => "Проект поставлен на паузу.",
                    OrderStatus.Active => "Проект возобновлен.",
                    _ => null
                };
                if (description is not null)
                {
                    dbContext.ProjectActivities.Add(new ProjectActivity
                    {
                        Id = Guid.NewGuid(),
                        OrderId = entry.Entity.Id,
                        ActorUserId = entry.Entity.CustomerId,
                        Action = currentStatus == OrderStatus.Paused ? "ProjectPaused" : "ProjectResumed",
                        Description = description,
                        CreatedAtUtc = DateTime.UtcNow
                    });
                }
            }

            var previousExecutor = entry.Property(order => order.ExecutorId).OriginalValue;
            var currentExecutor = entry.Property(order => order.ExecutorId).CurrentValue;
            if (previousExecutor != currentExecutor && currentExecutor.HasValue)
            {
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
        }

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return UpdateOrderPersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return UpdateOrderPersistenceResult.Conflict;
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
