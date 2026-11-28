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
using SelectProfi.backend.Configuration;
using SelectProfi.backend.Contracts.Orders;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Mappings;

public static class OrderResponseMapper
{
    private static decimal ResolveCommissionRate(
        decimal? storedCommissionRate,
        OrderPricingOptions pricingOptions)
    {
        var commissionRate = storedCommissionRate ?? pricingOptions.ServiceCommissionPercent;
        return decimal.Clamp(commissionRate, 0m, 1m);
    }

    public static OrderResponse ToResponse(
        this CreateOrderResult result,
        OrderPricingOptions? pricingOptions = null)
    {
        // @dvnull: Ранее response mapper не возвращал specialization/price отдельными полями; добавлено сквозное отображение новых атрибутов заказа.
        return new OrderResponse
        {
            Id = result.OrderId,
            CustomerId = result.CustomerId,
            ExecutorId = result.ExecutorId,
            Title = result.Title,
            Description = result.Description,
            Location = result.Location,
            EmployeeCompensation = result.EmployeeCompensation,
            WorkMode = result.WorkMode,
            SalaryMin = result.SalaryMin,
            SalaryMax = result.SalaryMax,
            FulfillmentDays = result.FulfillmentDays,
            WarrantyMonths = result.WarrantyMonths,
            GuaranteeReward = result.GuaranteeReward,
            Functional = result.Functional,
            Requirements = result.Requirements,
            OtherConditions = result.OtherConditions,
            SpecializationId = result.SpecializationId,
            Specialization = result.Specialization,
            Price = result.Price,
            ServiceCommissionRate = ResolveCommissionRate(
                result.ServiceCommissionRate,
                pricingOptions ?? new OrderPricingOptions()),
            CustomerCompanyName = result.CustomerCompanyName,
            RequestedCandidatesCount = result.RequestedCandidatesCount,
            Status = MapStatus(result.Status),
            DueDate = result.DueDate,
            CompletedAtUtc = result.CompletedAtUtc,
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
            IsFavorite = result.IsFavorite,
            MyResponseStatus = result.MyResponseStatus is { } responseStatus ? MapOrderResponseStatus(responseStatus) : null,
            MyResponseMessage = result.MyResponseMessage,
            CustomerId = result.CustomerId,
            ExecutorId = result.ExecutorId,
            Title = result.Title,
            Description = result.Description,
            Location = result.Location,
            EmployeeCompensation = result.EmployeeCompensation,
            Functional = result.Functional,
            Requirements = result.Requirements,
            OtherConditions = result.OtherConditions,
            SpecializationId = result.SpecializationId,
            Specialization = result.Specialization,
            Price = result.Price,
            WorkMode = result.WorkMode,
            SalaryMin = result.SalaryMin,
            SalaryMax = result.SalaryMax,
            FulfillmentDays = result.FulfillmentDays,
            WarrantyMonths = result.WarrantyMonths,
            GuaranteeReward = result.GuaranteeReward,
            ServiceCommissionRate = ResolveCommissionRate(result.ServiceCommissionRate, new OrderPricingOptions()),
            CustomerCompanyName = result.CustomerCompanyName,
            RequestedCandidatesCount = result.RequestedCandidatesCount,
            Status = MapStatus(result.Status),
            DueDate = result.DueDate,
            CompletedAtUtc = result.CompletedAtUtc,
            CreatedAtUtc = result.CreatedAtUtc,
            UpdatedAtUtc = result.UpdatedAtUtc,
            DeletedAtUtc = null
        };
    }

    public static OrderResponse ToResponse(this GetOrderByIdResult result, UserRole requesterRole, OrderPricingOptions pricingOptions)
    {
        return new OrderResponse
        {
            Id = result.OrderId,
            IsFavorite = result.IsFavorite,
            MyResponseStatus = result.MyResponseStatus is { } responseStatus ? MapOrderResponseStatus(responseStatus) : null,
            MyResponseMessage = result.MyResponseMessage,
            CustomerId = result.CustomerId,
            ExecutorId = result.ExecutorId,
            Title = result.Title,
            Description = result.Description,
            Location = result.Location,
            EmployeeCompensation = result.EmployeeCompensation,
            Functional = result.Functional,
            Requirements = result.Requirements,
            OtherConditions = result.OtherConditions,
            SpecializationId = result.SpecializationId,
            Specialization = result.Specialization,
            Price = result.Price,
            WorkMode = result.WorkMode,
            SalaryMin = result.SalaryMin,
            SalaryMax = result.SalaryMax,
            FulfillmentDays = result.FulfillmentDays,
            WarrantyMonths = result.WarrantyMonths,
            GuaranteeReward = result.GuaranteeReward,
            ServiceCommissionRate = ResolveCommissionRate(result.ServiceCommissionRate, pricingOptions),
            CustomerCompanyName = result.CustomerCompanyName,
            RequestedCandidatesCount = result.RequestedCandidatesCount,
            Status = MapStatus(result.Status),
            DueDate = result.DueDate,
            CompletedAtUtc = result.CompletedAtUtc,
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
                IsFavorite = item.IsFavorite,
                MyResponseStatus = item.MyResponseStatus is null ? null : MapOrderResponseStatus(item.MyResponseStatus.Value),
                MyResponseMessage = item.MyResponseMessage,
                CustomerId = item.CustomerId,
                ExecutorId = item.ExecutorId,
                Title = item.Title,
                Description = item.Description,
                Location = item.Location,
                EmployeeCompensation = item.EmployeeCompensation,
                WorkMode = item.WorkMode,
                SalaryMin = item.SalaryMin,
                SalaryMax = item.SalaryMax,
                FulfillmentDays = item.FulfillmentDays,
                WarrantyMonths = item.WarrantyMonths,
                GuaranteeReward = item.GuaranteeReward,
                Functional = item.Functional,
                Requirements = item.Requirements,
                OtherConditions = item.OtherConditions,
                SpecializationId = item.SpecializationId,
                Specialization = item.Specialization,
                Price = item.Price,
                ServiceCommissionRate = ResolveCommissionRate(item.ServiceCommissionRate, new OrderPricingOptions()),
                CustomerCompanyName = item.CustomerCompanyName,
                RequestedCandidatesCount = item.RequestedCandidatesCount,
                Status = MapStatus(item.Status),
                DueDate = item.DueDate,
                CompletedAtUtc = item.CompletedAtUtc,
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc,
                DeletedAtUtc = item.DeletedAtUtc
            }).ToArray(),
            Limit = result.Limit,
            Offset = result.Offset,
            TotalCount = result.TotalCount
        };
    }

    public static OrderListResponse ToResponse(this GetOrdersResult result, UserRole requesterRole, OrderPricingOptions pricingOptions)
    {
        return new OrderListResponse
        {
            Items = result.Items.Select(item => new OrderResponse
            {
                Id = item.OrderId,
                IsFavorite = item.IsFavorite,
                MyResponseStatus = item.MyResponseStatus is null ? null : MapOrderResponseStatus(item.MyResponseStatus.Value),
                MyResponseMessage = item.MyResponseMessage,
                CustomerId = item.CustomerId,
                ExecutorId = item.ExecutorId,
                Title = item.Title,
                Description = item.Description,
                Location = item.Location,
                EmployeeCompensation = item.EmployeeCompensation,
                Functional = item.Functional,
                Requirements = item.Requirements,
                OtherConditions = item.OtherConditions,
                SpecializationId = item.SpecializationId,
                Specialization = item.Specialization,
                Price = item.Price,
                WorkMode = item.WorkMode,
                SalaryMin = item.SalaryMin,
                SalaryMax = item.SalaryMax,
                FulfillmentDays = item.FulfillmentDays,
                WarrantyMonths = item.WarrantyMonths,
                GuaranteeReward = item.GuaranteeReward,
                ServiceCommissionRate = ResolveCommissionRate(item.ServiceCommissionRate, pricingOptions),
                CustomerCompanyName = item.CustomerCompanyName,
                RequestedCandidatesCount = item.RequestedCandidatesCount,
                Status = MapStatus(item.Status),
                DueDate = item.DueDate,
                CompletedAtUtc = item.CompletedAtUtc,
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc,
                DeletedAtUtc = item.DeletedAtUtc
            }).ToArray(),
            Limit = result.Limit,
            Offset = result.Offset,
            TotalCount = result.TotalCount
        };
    }

    public static OrderResponse ToResponse(
        this UpdateOrderResult result,
        OrderPricingOptions? pricingOptions = null)
    {
        return new OrderResponse
        {
            Id = result.OrderId,
            CustomerId = result.CustomerId,
            ExecutorId = result.ExecutorId,
            Title = result.Title,
            Description = result.Description,
            Location = result.Location,
            EmployeeCompensation = result.EmployeeCompensation,
            WorkMode = result.WorkMode,
            SalaryMin = result.SalaryMin,
            SalaryMax = result.SalaryMax,
            FulfillmentDays = result.FulfillmentDays,
            WarrantyMonths = result.WarrantyMonths,
            GuaranteeReward = result.GuaranteeReward,
            Functional = result.Functional,
            Requirements = result.Requirements,
            OtherConditions = result.OtherConditions,
            SpecializationId = result.SpecializationId,
            Specialization = result.Specialization,
            Price = result.Price,
            ServiceCommissionRate = ResolveCommissionRate(
                result.ServiceCommissionRate,
                pricingOptions ?? new OrderPricingOptions()),
            CustomerCompanyName = result.CustomerCompanyName,
            RequestedCandidatesCount = result.RequestedCandidatesCount,
            Status = MapStatus(result.Status),
            DueDate = result.DueDate,
            CompletedAtUtc = result.CompletedAtUtc,
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
            Message = result.Message,
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
                Message = item.Message,
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
            Message = result.Message,
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
            OrderStatus.Completed => OrderStatusContract.Completed,
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
