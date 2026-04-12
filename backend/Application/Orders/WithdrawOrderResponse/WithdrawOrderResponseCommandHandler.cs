using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.WithdrawOrderResponse;

public sealed class WithdrawOrderResponseCommandHandler(IWithdrawOrderResponsePersistence persistence)
    : ICommandHandler<WithdrawOrderResponseCommand, WithdrawOrderResponseResult>
{
    public async Task<WithdrawOrderResponseResult> HandleAsync(
        WithdrawOrderResponseCommand command,
        CancellationToken cancellationToken)
    {
        if (!OrderAccessRules.CanWithdrawOrderResponse(command.RequesterRole))
            return new WithdrawOrderResponseResult { ErrorCode = WithdrawOrderResponseErrorCode.Forbidden };

        var order = await persistence.FindOrderByIdAsync(command.OrderId, cancellationToken);
        if (order is null || order.DeletedAtUtc is not null)
            return new WithdrawOrderResponseResult { ErrorCode = WithdrawOrderResponseErrorCode.NotFound };

        var response = await persistence.FindExecutorResponseAsync(
            command.OrderId,
            command.RequesterUserId,
            cancellationToken);
        if (response is null)
            return new WithdrawOrderResponseResult { ErrorCode = WithdrawOrderResponseErrorCode.NotFound };

        if (response.Status != OrderResponseStatus.Pending)
            return new WithdrawOrderResponseResult { ErrorCode = WithdrawOrderResponseErrorCode.CannotWithdraw };

        response.Status = OrderResponseStatus.Withdrawn;
        response.UpdatedAtUtc = DateTime.UtcNow;

        var saveResult = await persistence.SaveChangesAsync(cancellationToken);
        if (saveResult == WithdrawOrderResponsePersistenceResult.Conflict)
            return new WithdrawOrderResponseResult { ErrorCode = WithdrawOrderResponseErrorCode.Conflict };

        return new WithdrawOrderResponseResult
        {
            ErrorCode = WithdrawOrderResponseErrorCode.None,
            OrderId = response.OrderId,
            ExecutorId = response.ExecutorId,
            Status = response.Status,
            UpdatedAtUtc = response.UpdatedAtUtc
        };
    }
}
