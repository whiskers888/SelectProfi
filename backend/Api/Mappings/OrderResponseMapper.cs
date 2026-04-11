using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Application.Orders.GetOrderExecutors;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Contracts.Orders;
using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Mappings;

public static class OrderResponseMapper
{
    public static OrderResponse ToResponse(this CreateOrderResult result)
    {
        return new OrderResponse
        {
            Id = result.OrderId,
            CustomerId = result.CustomerId,
            ExecutorId = result.ExecutorId,
            Title = result.Title,
            Description = result.Description,
            Status = MapStatus(result.Status),
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc,
            DeletedAtUtc = null
        };
    }

    public static OrderResponse ToResponse(this GetOrderByIdResult result)
    {
        return new OrderResponse
        {
            Id = result.OrderId,
            CustomerId = result.CustomerId,
            ExecutorId = result.ExecutorId,
            Title = result.Title,
            Description = result.Description,
            Status = MapStatus(result.Status),
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc,
            DeletedAtUtc = null
        };
    }

    public static OrderListResponse ToResponse(this GetOrdersResult result)
    {
        return new OrderListResponse
        {
            Items = result.Items.Select(item => new OrderResponse
            {
                Id = item.OrderId,
                CustomerId = item.CustomerId,
                ExecutorId = item.ExecutorId,
                Title = item.Title,
                Description = item.Description,
                Status = MapStatus(item.Status),
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc,
                DeletedAtUtc = item.DeletedAtUtc
            }).ToArray(),
            Limit = result.Limit,
            Offset = result.Offset
        };
    }

    public static OrderResponse ToResponse(this UpdateOrderResult result)
    {
        return new OrderResponse
        {
            Id = result.OrderId,
            CustomerId = result.CustomerId,
            ExecutorId = result.ExecutorId,
            Title = result.Title,
            Description = result.Description,
            Status = MapStatus(result.Status),
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc,
            DeletedAtUtc = null
        };
    }

    public static OrderExecutorListResponse ToResponse(this GetOrderExecutorsResult result)
    {
        return new OrderExecutorListResponse
        {
            Items = result.Items.Select(item => new OrderExecutorResponse
            {
                Id = item.ExecutorId,
                FullName = item.FullName
            }).ToArray()
        };
    }

    private static OrderStatusContract MapStatus(OrderStatus status)
    {
        return status switch
        {
            OrderStatus.Active => OrderStatusContract.Active,
            OrderStatus.Paused => OrderStatusContract.Paused,
            _ => throw new ArgumentOutOfRangeException(nameof(status), status, "Unsupported order status.")
        };
    }
}
