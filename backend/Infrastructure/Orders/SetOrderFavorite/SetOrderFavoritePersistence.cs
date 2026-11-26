using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.SetOrderFavorite;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.SetOrderFavorite;

public sealed class SetOrderFavoritePersistence(AppDbContext dbContext) : ISetOrderFavoritePersistence
{
    public Task<Order?> FindOrderAsync(Guid orderId, CancellationToken cancellationToken) =>
        dbContext.Orders.AsNoTracking().FirstOrDefaultAsync(order => order.Id == orderId, cancellationToken);

    public async Task SetAsync(Guid orderId, Guid executorId, bool isFavorite, CancellationToken cancellationToken)
    {
        if (isFavorite)
            await dbContext.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO "OrderFavorites" ("OrderId", "ExecutorId", "CreatedAtUtc")
                VALUES ({orderId}, {executorId}, {DateTime.UtcNow})
                ON CONFLICT ("OrderId", "ExecutorId") DO NOTHING
                """, cancellationToken);
        else
            await dbContext.OrderFavorites
                .Where(favorite => favorite.OrderId == orderId && favorite.ExecutorId == executorId)
                .ExecuteDeleteAsync(cancellationToken);
    }
}
