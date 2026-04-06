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

        var orders = await persistence.FindVisibleActiveOrdersAsync(
            query.RequesterUserId,
            query.RequesterRole,
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
            CreatedAtUtc = order.CreatedAtUtc,
            UpdatedAtUtc = order.UpdatedAtUtc
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
