using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.SelectOrderResponseExecutor;

public sealed class SelectOrderResponseExecutorCommandHandler(ISelectOrderResponseExecutorPersistence persistence)
    : ICommandHandler<SelectOrderResponseExecutorCommand, SelectOrderResponseExecutorResult>
{
    public async Task<SelectOrderResponseExecutorResult> HandleAsync(
        SelectOrderResponseExecutorCommand command,
        CancellationToken cancellationToken)
    {
        var order = await persistence.FindOrderByIdAsync(command.OrderId, cancellationToken);
        if (order is null || order.DeletedAtUtc is not null)
            return new SelectOrderResponseExecutorResult { ErrorCode = SelectOrderResponseExecutorErrorCode.NotFound };

        if (!OrderAccessRules.CanManageOrderResponses(command.RequesterRole, command.RequesterUserId, order.CustomerId))
            return new SelectOrderResponseExecutorResult { ErrorCode = SelectOrderResponseExecutorErrorCode.Forbidden };

        if (order.Status != OrderStatus.Active || order.ExecutorId.HasValue)
            return new SelectOrderResponseExecutorResult { ErrorCode = SelectOrderResponseExecutorErrorCode.NotAvailable };

        var responses = await persistence.FindOrderResponsesAsync(command.OrderId, cancellationToken);
        var selectedResponse = responses.FirstOrDefault(response => response.ExecutorId == command.ExecutorId);
        if (selectedResponse is null || selectedResponse.Status != OrderResponseStatus.Pending)
            return new SelectOrderResponseExecutorResult { ErrorCode = SelectOrderResponseExecutorErrorCode.ResponseNotFound };

        var utcNow = DateTime.UtcNow;
        foreach (var response in responses.Where(item => item.Status == OrderResponseStatus.Pending))
        {
            response.Status = response.ExecutorId == command.ExecutorId
                ? OrderResponseStatus.Accepted
                : OrderResponseStatus.Rejected;
            response.UpdatedAtUtc = utcNow;
        }

        order.ExecutorId = command.ExecutorId;
        order.UpdatedAtUtc = utcNow;

        var saveResult = await persistence.SaveChangesAsync(cancellationToken);
        if (saveResult == SelectOrderResponseExecutorPersistenceResult.Conflict)
            return new SelectOrderResponseExecutorResult { ErrorCode = SelectOrderResponseExecutorErrorCode.Conflict };

        return new SelectOrderResponseExecutorResult
        {
            ErrorCode = SelectOrderResponseExecutorErrorCode.None,
            OrderId = order.Id,
            ExecutorId = command.ExecutorId,
            UpdatedAtUtc = utcNow
        };
    }
}
