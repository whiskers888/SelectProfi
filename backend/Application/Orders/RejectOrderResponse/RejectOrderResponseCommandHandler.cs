using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.RejectOrderResponse;

public sealed class RejectOrderResponseCommandHandler(IRejectOrderResponsePersistence persistence)
    : ICommandHandler<RejectOrderResponseCommand, RejectOrderResponseResult>
{
    public async Task<RejectOrderResponseResult> HandleAsync(
        RejectOrderResponseCommand command,
        CancellationToken cancellationToken)
    {
        var order = await persistence.FindOrderByIdAsync(command.OrderId, cancellationToken);
        if (order is null || order.DeletedAtUtc is not null)
            return new RejectOrderResponseResult { ErrorCode = RejectOrderResponseErrorCode.NotFound };

        if (!OrderAccessRules.CanManageOrderResponses(command.RequesterRole, command.RequesterUserId, order.CustomerId))
            return new RejectOrderResponseResult { ErrorCode = RejectOrderResponseErrorCode.Forbidden };

        if (order.Status != OrderStatus.Active || order.ExecutorId.HasValue)
            return new RejectOrderResponseResult { ErrorCode = RejectOrderResponseErrorCode.NotAvailable };

        var response = await persistence.FindOrderResponseAsync(command.OrderId, command.ExecutorId, cancellationToken);
        if (response is null)
            return new RejectOrderResponseResult { ErrorCode = RejectOrderResponseErrorCode.ResponseNotFound };

        if (response.Status != OrderResponseStatus.Pending)
            return new RejectOrderResponseResult { ErrorCode = RejectOrderResponseErrorCode.CannotReject };

        response.Status = OrderResponseStatus.Rejected;
        response.UpdatedAtUtc = DateTime.UtcNow;

        var saveResult = await persistence.SaveChangesAsync(cancellationToken);
        if (saveResult == RejectOrderResponsePersistenceResult.Conflict)
            return new RejectOrderResponseResult { ErrorCode = RejectOrderResponseErrorCode.Conflict };

        return new RejectOrderResponseResult
        {
            ErrorCode = RejectOrderResponseErrorCode.None,
            OrderId = response.OrderId,
            ExecutorId = response.ExecutorId,
            Status = response.Status,
            UpdatedAtUtc = response.UpdatedAtUtc
        };
    }
}
