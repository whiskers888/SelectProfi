using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Contracts.Orders;

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
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
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
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
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
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc
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
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }
}
