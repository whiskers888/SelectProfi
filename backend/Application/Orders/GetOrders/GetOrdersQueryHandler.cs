using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetOrders;

public sealed class GetOrdersQueryHandler(IGetOrdersPersistence persistence)
    : IQueryHandler<GetOrdersQuery, GetOrdersResult>
{
    public async Task<GetOrdersResult> HandleAsync(GetOrdersQuery query, CancellationToken cancellationToken)
    {
        if (!OrderAccessRules.CanReadOrders(query.RequesterRole))
            return new GetOrdersResult { ErrorCode = GetOrdersErrorCode.Forbidden };

        var orders = await persistence.FindVisibleOrdersAsync(
            query.RequesterUserId,
            query.RequesterRole,
            query.IncludeArchived,
            query.ExchangeOnly,
            query.Search,
            query.Location,
            query.SpecializationId,
            query.WorkMode,
            query.HasWarranty,
            query.MinimumReward,
            query.DefaultServiceCommissionRate,
            query.FavoritesOnly,
            query.ResponsesOnly,
            query.SortBy,
            query.Limit,
            query.Offset,
            cancellationToken);
        var totalCount = await persistence.CountVisibleOrdersAsync(
            query.RequesterUserId, query.RequesterRole, query.IncludeArchived, query.ExchangeOnly,
            query.Search, query.Location, query.SpecializationId, query.WorkMode,
            query.HasWarranty, query.MinimumReward, query.DefaultServiceCommissionRate,
            query.FavoritesOnly, query.ResponsesOnly,
            cancellationToken);

        var exchangeStates = query.RequesterRole == UserRole.Executor
            ? await persistence.FindExchangeStatesAsync(query.RequesterUserId, orders.Select(order => order.Id).ToArray(), cancellationToken)
            : new Dictionary<Guid, OrderExchangeState>();

        var items = orders.Select(order => new GetOrdersItemResult
        {
            OrderId = order.Id,
            IsFavorite = exchangeStates.TryGetValue(order.Id, out var state) && state.IsFavorite,
            MyResponseStatus = exchangeStates.TryGetValue(order.Id, out state) ? state.MyResponseStatus : null,
            MyResponseMessage = exchangeStates.TryGetValue(order.Id, out state) ? state.MyResponseMessage : null,
            CustomerId = order.CustomerId,
            ExecutorId = order.ExecutorId,
            Title = order.Title,
            Description = order.Description,
            Location = order.Location,
            EmployeeCompensation = order.EmployeeCompensation,
            WorkMode = order.WorkMode,
            SalaryMin = order.SalaryMin,
            SalaryMax = order.SalaryMax,
            FulfillmentDays = order.FulfillmentDays,
            WarrantyMonths = order.WarrantyMonths,
            GuaranteeReward = order.GuaranteeReward,
            Functional = order.Functional,
            Requirements = order.Requirements,
            OtherConditions = order.OtherConditions,
            // @dvnull: Ранее list-query не включал specialization/price; добавлены поля в список заказов.
            SpecializationId = order.SpecializationId,
            Specialization = order.Specialization,
            Price = order.Price,
            ServiceCommissionRate = order.ServiceCommissionRate,
            CustomerCompanyName = order.CustomerCompanyName,
            RequestedCandidatesCount = order.RequestedCandidatesCount,
            Status = order.Status,
            CreatedAtUtc = order.CreatedAtUtc,
            UpdatedAtUtc = order.UpdatedAtUtc,
            DeletedAtUtc = order.DeletedAtUtc,
            DueDate = order.DueDate,
            CompletedAtUtc = order.CompletedAtUtc
        }).ToArray();

        return new GetOrdersResult
        {
            ErrorCode = GetOrdersErrorCode.None,
            Items = items,
            Limit = query.Limit,
            Offset = query.Offset,
            TotalCount = totalCount
        };
    }
}
