using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Application.Orders.DeleteOrder;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Application.Orders.GetOrderExecutors;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Contracts.Orders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Mappings;

public static class OrderRequestMapper
{
    public static CreateOrderCommand ToCommand(this CreateOrderRequest request, Guid customerId)
    {
        return new CreateOrderCommand
        {
            CustomerId = customerId,
            Title = request.Title,
            Description = request.Description
        };
    }

    public static GetOrderByIdQuery ToQuery(this Guid orderId, Guid requesterUserId, UserRole requesterRole)
    {
        return new GetOrderByIdQuery
        {
            OrderId = orderId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static GetOrdersQuery ToQuery(
        this GetOrdersRequest request,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new GetOrdersQuery
        {
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole,
            Limit = request.Limit,
            Offset = request.Offset
        };
    }

    public static GetOrderExecutorsQuery ToQuery(Guid requesterUserId, UserRole requesterRole)
    {
        return new GetOrderExecutorsQuery
        {
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static UpdateOrderCommand ToCommand(
        this UpdateOrderRequest request,
        Guid orderId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new UpdateOrderCommand
        {
            OrderId = orderId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole,
            Title = request.Title,
            Description = request.Description,
            ExecutorId = request.ExecutorId
        };
    }

    public static DeleteOrderCommand ToDeleteOrderCommand(this Guid orderId, Guid requesterUserId, UserRole requesterRole)
    {
        return new DeleteOrderCommand
        {
            OrderId = orderId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }
}
