using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Application.Orders.GetOrderExecutors;
using SelectProfi.backend.Application.Orders.GetMyOrderResponse;
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
using SelectProfi.backend.Contracts.Orders;
using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Mappings;

public static class OrderResponseMapper
{
    public static OrderResponse ToResponse(this CreateOrderResult result)
    {
        // @dvnull: Ранее response mapper не возвращал specialization/price отдельными полями; добавлено сквозное отображение новых атрибутов заказа.
        return new OrderResponse
        {
            Id = result.OrderId,
            CustomerId = result.CustomerId,
            ExecutorId = result.ExecutorId,
            Title = result.Title,
            Description = result.Description,
            SpecializationId = result.SpecializationId,
            Specialization = result.Specialization,
            Price = result.Price,
            CustomerCompanyName = result.CustomerCompanyName,
            RequestedCandidatesCount = result.RequestedCandidatesCount,
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
            SpecializationId = result.SpecializationId,
            Specialization = result.Specialization,
            Price = result.Price,
            CustomerCompanyName = result.CustomerCompanyName,
            RequestedCandidatesCount = result.RequestedCandidatesCount,
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
                SpecializationId = item.SpecializationId,
                Specialization = item.Specialization,
                Price = item.Price,
                CustomerCompanyName = item.CustomerCompanyName,
                RequestedCandidatesCount = item.RequestedCandidatesCount,
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
            SpecializationId = result.SpecializationId,
            Specialization = result.Specialization,
            Price = result.Price,
            CustomerCompanyName = result.CustomerCompanyName,
            RequestedCandidatesCount = result.RequestedCandidatesCount,
            Status = MapStatus(result.Status),
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc,
            DeletedAtUtc = null
        };
    }

    public static OrderExecutorResponseItemResponse ToResponse(this RespondToOrderResult result)
    {
        return new OrderExecutorResponseItemResponse
        {
            ExecutorId = result.ExecutorId,
            ExecutorFullName = string.Empty,
            Status = MapOrderResponseStatus(result.Status),
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }

    public static OrderExecutorResponseItemResponse ToResponse(this WithdrawOrderResponseResult result)
    {
        return new OrderExecutorResponseItemResponse
        {
            ExecutorId = result.ExecutorId,
            ExecutorFullName = string.Empty,
            Status = MapOrderResponseStatus(result.Status),
            CreatedAtUtc = result.UpdatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }

    public static OrderExecutorResponseItemResponse ToResponse(this RejectOrderResponseResult result)
    {
        return new OrderExecutorResponseItemResponse
        {
            ExecutorId = result.ExecutorId,
            ExecutorFullName = string.Empty,
            Status = MapOrderResponseStatus(result.Status),
            CreatedAtUtc = result.UpdatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }

    public static OrderExecutorResponsesResponse ToResponse(this GetOrderResponsesResult result)
    {
        return new OrderExecutorResponsesResponse
        {
            Items = result.Items.Select(item => new OrderExecutorResponseItemResponse
            {
                ExecutorId = item.ExecutorId,
                ExecutorFullName = item.ExecutorFullName,
                ExecutorGrade = item.ExecutorGrade,
                ExecutorProjectTitle = item.ExecutorProjectTitle,
                ExecutorProjectCompanyName = item.ExecutorProjectCompanyName,
                ExecutorExperienceSummary = item.ExecutorExperienceSummary,
                Status = MapOrderResponseStatus(item.Status),
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc
            }).ToArray()
        };
    }

    public static MyOrderResponseResponse ToResponse(this GetMyOrderResponseResult result)
    {
        return new MyOrderResponseResponse
        {
            OrderId = result.OrderId,
            HasResponse = result.HasResponse,
            Status = result.Status is null ? null : MapOrderResponseStatus(result.Status.Value),
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }

    public static SelectOrderResponseExecutorResponse ToResponse(this SelectOrderResponseExecutorResult result)
    {
        return new SelectOrderResponseExecutorResponse
        {
            OrderId = result.OrderId,
            ExecutorId = result.ExecutorId,
            UpdatedAtUtc = result.UpdatedAtUtc,
        };
    }

    public static OrderExecutorListResponse ToResponse(this GetOrderExecutorsResult result)
    {
        return new OrderExecutorListResponse
        {
            Items = result.Items.Select(item => new SelectProfi.backend.Contracts.Orders.OrderExecutorResponse
            {
                Id = item.ExecutorId,
                FullName = item.FullName
            }).ToArray()
        };
    }

    public static OrderSpecializationListResponse ToResponse(this GetOrderSpecializationsResult result)
    {
        // @dvnull: Ранее специализации формировались прямо в контроллере; вынесен mapper-слой под общий CQRS-подход API.
        return new OrderSpecializationListResponse
        {
            Items = result.Items.Select(item => new OrderSpecializationResponse
            {
                Id = item.Id,
                Name = item.Name,
                IsActive = item.IsActive,
                SortOrder = item.SortOrder,
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc
            }).ToArray()
        };
    }

    public static OrderSpecializationResponse ToResponse(this CreateOrderSpecializationResult result)
    {
        return new OrderSpecializationResponse
        {
            Id = result.SpecializationId,
            Name = result.Name,
            IsActive = result.IsActive,
            SortOrder = result.SortOrder,
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
        };
    }

    public static OrderSpecializationResponse ToResponse(this UpdateOrderSpecializationResult result)
    {
        return new OrderSpecializationResponse
        {
            Id = result.SpecializationId,
            Name = result.Name,
            IsActive = result.IsActive,
            SortOrder = result.SortOrder,
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc
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

    private static OrderExecutorResponseStatusContract MapOrderResponseStatus(OrderResponseStatus status)
    {
        return status switch
        {
            OrderResponseStatus.Pending => OrderExecutorResponseStatusContract.Pending,
            OrderResponseStatus.Withdrawn => OrderExecutorResponseStatusContract.Withdrawn,
            OrderResponseStatus.Accepted => OrderExecutorResponseStatusContract.Accepted,
            OrderResponseStatus.Rejected => OrderExecutorResponseStatusContract.Rejected,
            _ => throw new ArgumentOutOfRangeException(nameof(status), status, "Unsupported order response status.")
        };
    }
}
