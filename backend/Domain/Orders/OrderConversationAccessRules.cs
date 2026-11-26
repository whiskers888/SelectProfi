using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Domain.Orders;

public static class OrderConversationAccessRules
{
    public static bool CanStartOrReadOrderConversation(UserRole role, Guid requesterId, Order order) =>
        order.ExecutorId is not null &&
        (role == UserRole.Customer && order.CustomerId == requesterId ||
         role == UserRole.Executor && order.ExecutorId == requesterId);

    public static bool CanReadConversation(UserRole role, Guid requesterId, Order order, OrderConversation conversation) =>
        CanStartOrReadOrderConversation(role, requesterId, order) &&
        conversation.OrderId == order.Id &&
        conversation.CustomerId == order.CustomerId &&
        conversation.ExecutorId == order.ExecutorId;
}
