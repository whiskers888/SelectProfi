using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Orders.GetMyOrderResponse;

public sealed class GetMyOrderResponseQueryHandler(IGetMyOrderResponsePersistence persistence)
    : IQueryHandler<GetMyOrderResponseQuery, GetMyOrderResponseResult>
{
    public async Task<GetMyOrderResponseResult> HandleAsync(
        GetMyOrderResponseQuery query,
        CancellationToken cancellationToken)
    {
        if (!OrderAccessRules.CanRespondToOrder(query.RequesterRole))
            return new GetMyOrderResponseResult { ErrorCode = GetMyOrderResponseErrorCode.Forbidden };

        var order = await persistence.FindOrderByIdAsync(query.OrderId, cancellationToken);
        if (order is null || order.DeletedAtUtc is not null)
            return new GetMyOrderResponseResult { ErrorCode = GetMyOrderResponseErrorCode.NotFound };

        if (!OrderAccessRules.CanReadOrder(query.RequesterRole, query.RequesterUserId, order.CustomerId, order.ExecutorId))
            return new GetMyOrderResponseResult { ErrorCode = GetMyOrderResponseErrorCode.Forbidden };

        var response = await persistence.FindExecutorResponseAsync(query.OrderId, query.RequesterUserId, cancellationToken);

        return new GetMyOrderResponseResult
        {
            ErrorCode = GetMyOrderResponseErrorCode.None,
            OrderId = query.OrderId,
            HasResponse = response is not null,
            Status = response?.Status,
            UpdatedAtUtc = response?.UpdatedAtUtc
        };
    }
}
