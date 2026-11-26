using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.Messages;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.Messages;

public sealed class OrderConversationPersistence(AppDbContext dbContext) : IOrderConversationPersistence
{
    public async Task<OrderConversation> GetOrCreateAsync(
        Guid orderId,
        Guid customerId,
        Guid executorId,
        DateTime createdAtUtc,
        CancellationToken cancellationToken)
    {
        await dbContext.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO "OrderConversations" ("Id", "OrderId", "CustomerId", "ExecutorId", "CreatedAtUtc")
            VALUES ({Guid.NewGuid()}, {orderId}, {customerId}, {executorId}, {createdAtUtc})
            ON CONFLICT ("OrderId", "ExecutorId") DO NOTHING
            """, cancellationToken);

        return await dbContext.OrderConversations.SingleAsync(
            conversation => conversation.OrderId == orderId && conversation.ExecutorId == executorId,
            cancellationToken);
    }
}
