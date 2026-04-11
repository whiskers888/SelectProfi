using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.UpdateOrder;

public sealed class UpdateOrderCommandHandler(IUpdateOrderPersistence persistence)
    : ICommandHandler<UpdateOrderCommand, UpdateOrderResult>
{
    public async Task<UpdateOrderResult> HandleAsync(UpdateOrderCommand command, CancellationToken cancellationToken)
    {
        var order = await persistence.FindByIdAsync(command.OrderId, cancellationToken);
        if (order is null)
            return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.NotFound };

        if (!OrderAccessRules.CanManageOrder(command.RequesterRole, command.RequesterUserId, order.CustomerId))
            return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.Forbidden };

        // @dvnull: Ранее PATCH обновлял только активные заказы; теперь статусный PATCH разрешает восстановление soft-deleted заказа из архива.
        if (order.DeletedAtUtc is not null)
        {
            if (!command.Status.HasValue)
                return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.NotFound };

            order.DeletedAtUtc = null;
        }

        if (command.Title is not null)
            order.Title = command.Title.Trim();

        if (command.Description is not null)
            order.Description = command.Description.Trim();

        if (command.ExecutorId.HasValue)
        {
            var executorExists = await persistence.ExecutorExistsAsync(command.ExecutorId.Value, cancellationToken);
            if (!executorExists)
                return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.ExecutorNotFound };

            order.ExecutorId = command.ExecutorId.Value;
        }

        if (command.Status.HasValue)
            order.Status = command.Status.Value;

        order.UpdatedAtUtc = DateTime.UtcNow;

        var saveResult = await persistence.SaveChangesAsync(cancellationToken);
        if (saveResult == UpdateOrderPersistenceResult.Conflict)
            return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.Conflict };

        return new UpdateOrderResult
        {
            ErrorCode = UpdateOrderErrorCode.None,
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
