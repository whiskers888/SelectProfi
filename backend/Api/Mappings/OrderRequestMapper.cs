using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Application.Orders.DeleteOrder;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Application.Orders.GetOrderExecutors;
using SelectProfi.backend.Application.Orders.GetMyOrderResponse;
using SelectProfi.backend.Application.Orders.GetMyOrders;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Application.Orders.GetOrderResponses;
using SelectProfi.backend.Application.Orders.GetOrderSpecializations;
using SelectProfi.backend.Application.Orders.RejectOrderResponse;
using SelectProfi.backend.Application.Orders.RespondToOrder;
using SelectProfi.backend.Application.Orders.SelectOrderResponseExecutor;
using SelectProfi.backend.Application.Orders.CreateOrderSpecialization;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Application.Orders.UpdateOrderSpecialization;
using SelectProfi.backend.Application.Orders.WithdrawOrderResponse;
using SelectProfi.backend.Domain.Orders;
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
            Description = request.Description,
            // @dvnull: Ранее mapper пробрасывал только title/description; добавлены specialization/price в create-command.
            Specialization = request.Specialization ?? string.Empty,
            SpecializationId = request.SpecializationId,
            Price = request.Price ?? 0m,
            RequestedCandidatesCount = request.RequestedCandidatesCount
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
        // @dvnull: Пробрасываем includeArchived, чтобы фронт мог запросить активные + архивные заказы одним вызовом.
        return new GetOrdersQuery
        {
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole,
            Limit = request.Limit,
            Offset = request.Offset,
            IncludeArchived = request.IncludeArchived
        };
    }

    public static GetMyOrdersQuery ToMyOrdersQuery(
        this GetOrdersRequest request,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new GetMyOrdersQuery
        {
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole,
            Limit = request.Limit,
            Offset = request.Offset,
            IncludeArchived = request.IncludeArchived
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
            // @dvnull: Ранее PATCH mapper не учитывал specialization/price; добавлен проброс в update-command.
            Specialization = request.Specialization,
            SpecializationId = request.SpecializationId,
            Price = request.Price,
            ExecutorId = request.ExecutorId,
            Status = request.Status is null ? null : MapStatus(request.Status.Value)
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

    public static RespondToOrderCommand ToRespondToOrderCommand(
        this Guid orderId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new RespondToOrderCommand
        {
            OrderId = orderId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static WithdrawOrderResponseCommand ToWithdrawOrderResponseCommand(
        this Guid orderId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new WithdrawOrderResponseCommand
        {
            OrderId = orderId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static GetOrderResponsesQuery ToGetOrderResponsesQuery(
        this Guid orderId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new GetOrderResponsesQuery
        {
            OrderId = orderId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static GetMyOrderResponseQuery ToGetMyOrderResponseQuery(
        this Guid orderId,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new GetMyOrderResponseQuery
        {
            OrderId = orderId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static SelectOrderResponseExecutorCommand ToSelectOrderResponseExecutorCommand(
        this (Guid orderId, Guid executorId) routeData,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new SelectOrderResponseExecutorCommand
        {
            OrderId = routeData.orderId,
            ExecutorId = routeData.executorId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static RejectOrderResponseCommand ToRejectOrderResponseCommand(
        this (Guid orderId, Guid executorId) routeData,
        Guid requesterUserId,
        UserRole requesterRole)
    {
        return new RejectOrderResponseCommand
        {
            OrderId = routeData.orderId,
            ExecutorId = routeData.executorId,
            RequesterUserId = requesterUserId,
            RequesterRole = requesterRole
        };
    }

    public static GetOrderSpecializationsQuery ToGetOrderSpecializationsQuery(this bool includeInactive)
    {
        // @dvnull: Ранее запрос специализаций формировался в контроллере напрямую; вынесено в mapper для единообразия с остальными endpoint-ами.
        return new GetOrderSpecializationsQuery
        {
            IncludeInactive = includeInactive
        };
    }

    public static CreateOrderSpecializationCommand ToCommand(this CreateOrderSpecializationRequest request)
    {
        return new CreateOrderSpecializationCommand
        {
            Name = request.Name,
            SortOrder = request.SortOrder
        };
    }

    public static UpdateOrderSpecializationCommand ToCommand(
        this UpdateOrderSpecializationRequest request,
        Guid specializationId)
    {
        return new UpdateOrderSpecializationCommand
        {
            SpecializationId = specializationId,
            Name = request.Name,
            IsActive = request.IsActive,
            SortOrder = request.SortOrder
        };
    }

    private static OrderStatus MapStatus(OrderStatusContract status)
    {
        return status switch
        {
            OrderStatusContract.Active => OrderStatus.Active,
            OrderStatusContract.Paused => OrderStatus.Paused,
            _ => throw new ArgumentOutOfRangeException(nameof(status), status, "Unsupported order status.")
        };
    }
}
