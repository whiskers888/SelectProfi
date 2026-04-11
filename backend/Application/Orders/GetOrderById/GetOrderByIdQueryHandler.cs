using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetOrderById;

public sealed class GetOrderByIdQueryHandler(IGetOrderByIdPersistence persistence)
    : IQueryHandler<GetOrderByIdQuery, GetOrderByIdResult>
{
    public async Task<GetOrderByIdResult> HandleAsync(GetOrderByIdQuery query, CancellationToken cancellationToken)
    {
        var order = await persistence.FindActiveByIdAsync(query.OrderId, cancellationToken);
        if (order is null)
            return new GetOrderByIdResult { ErrorCode = GetOrderByIdErrorCode.NotFound };

        if (!OrderAccessRules.CanReadOrder(query.RequesterRole, query.RequesterUserId, order.CustomerId, order.ExecutorId))
            return new GetOrderByIdResult { ErrorCode = GetOrderByIdErrorCode.Forbidden };

        return new GetOrderByIdResult
        {
            ErrorCode = GetOrderByIdErrorCode.None,
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            ExecutorId = order.ExecutorId,
            Title = order.Title,
            Description = order.Description,
            Status = order.Status,
            CreatedAtUtc = order.CreatedAtUtc,
            UpdatedAtUtc = order.UpdatedAtUtc
        };
    }
}
