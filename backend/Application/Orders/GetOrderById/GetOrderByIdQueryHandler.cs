using SelectProfi.backend.Application.Cqrs;
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

        if (!CanReadOrder(query.RequesterRole, query.RequesterUserId, order.CustomerId, order.ExecutorId))
            return new GetOrderByIdResult { ErrorCode = GetOrderByIdErrorCode.Forbidden };

        return new GetOrderByIdResult
        {
            ErrorCode = GetOrderByIdErrorCode.None,
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            ExecutorId = order.ExecutorId,
            Title = order.Title,
            Description = order.Description,
            CreatedAtUtc = order.CreatedAtUtc,
            UpdatedAtUtc = order.UpdatedAtUtc
        };
    }

    private static bool CanReadOrder(
        UserRole requesterRole,
        Guid requesterUserId,
        Guid orderCustomerId,
        Guid? orderExecutorId)
    {
        return requesterRole switch
        {
            UserRole.Admin => true,
            UserRole.Customer => requesterUserId == orderCustomerId,
            UserRole.Executor => orderExecutorId == null || orderExecutorId == requesterUserId,
            _ => false
        };
    }
}
