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
            query.Limit,
            query.Offset,
            cancellationToken);

        var items = orders.Select(order => new GetOrdersItemResult
        {
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            ExecutorId = order.ExecutorId,
            Title = order.Title,
            Description = order.Description,
            Status = order.Status,
            CreatedAtUtc = order.CreatedAtUtc,
            UpdatedAtUtc = order.UpdatedAtUtc,
            DeletedAtUtc = order.DeletedAtUtc
        }).ToArray();

        return new GetOrdersResult
        {
            ErrorCode = GetOrdersErrorCode.None,
            Items = items,
            Limit = query.Limit,
            Offset = query.Offset
        };
    }
}
