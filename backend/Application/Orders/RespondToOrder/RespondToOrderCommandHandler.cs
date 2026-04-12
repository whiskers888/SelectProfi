using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.RespondToOrder;

public sealed class RespondToOrderCommandHandler(IRespondToOrderPersistence persistence)
    : ICommandHandler<RespondToOrderCommand, RespondToOrderResult>
{
    public async Task<RespondToOrderResult> HandleAsync(RespondToOrderCommand command, CancellationToken cancellationToken)
    {
        if (!OrderAccessRules.CanRespondToOrder(command.RequesterRole))
            return new RespondToOrderResult { ErrorCode = RespondToOrderErrorCode.Forbidden };

        var order = await persistence.FindOrderByIdAsync(command.OrderId, cancellationToken);
        if (order is null || order.DeletedAtUtc is not null)
            return new RespondToOrderResult { ErrorCode = RespondToOrderErrorCode.NotFound };

        if (order.Status != OrderStatus.Active || order.ExecutorId.HasValue)
            return new RespondToOrderResult { ErrorCode = RespondToOrderErrorCode.NotAvailable };

        var existingResponse = await persistence.FindExecutorResponseAsync(
            command.OrderId,
            command.RequesterUserId,
            cancellationToken);
        if (existingResponse is not null)
            return new RespondToOrderResult { ErrorCode = RespondToOrderErrorCode.AlreadyResponded };

        var utcNow = DateTime.UtcNow;
        var response = new OrderExecutorResponse
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            ExecutorId = command.RequesterUserId,
            Status = OrderResponseStatus.Pending,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        persistence.Add(response);
        var saveResult = await persistence.SaveChangesAsync(cancellationToken);
        if (saveResult == RespondToOrderPersistenceResult.Conflict)
            return new RespondToOrderResult { ErrorCode = RespondToOrderErrorCode.Conflict };

        return new RespondToOrderResult
        {
            ErrorCode = RespondToOrderErrorCode.None,
            OrderId = response.OrderId,
            ExecutorId = response.ExecutorId,
            Status = response.Status,
            CreatedAtUtc = response.CreatedAtUtc,
            UpdatedAtUtc = response.UpdatedAtUtc
        };
    }
}
