using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.Messages;

public interface IOrderConversationPersistence
{
    Task<OrderConversation> GetOrCreateAsync(
        Guid orderId,
        Guid customerId,
        Guid executorId,
        DateTime createdAtUtc,
        CancellationToken cancellationToken);
}
