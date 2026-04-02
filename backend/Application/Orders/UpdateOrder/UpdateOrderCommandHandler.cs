using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.UpdateOrder;

public sealed class UpdateOrderCommandHandler(IUpdateOrderPersistence persistence)
    : ICommandHandler<UpdateOrderCommand, UpdateOrderResult>
{
    public async Task<UpdateOrderResult> HandleAsync(UpdateOrderCommand command, CancellationToken cancellationToken)
    {
        var order = await persistence.FindActiveByIdAsync(command.OrderId, cancellationToken);
        if (order is null)
            return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.NotFound };

        if (!CanManage(command.RequesterRole, command.RequesterUserId, order.CustomerId))
            return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.Forbidden };

        if (command.Title is not null)
            order.Title = command.Title.Trim();

        if (command.Description is not null)
            order.Description = command.Description.Trim();

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
            CreatedAtUtc = order.CreatedAtUtc,
            UpdatedAtUtc = order.UpdatedAtUtc
        };
    }

    private static bool CanManage(UserRole requesterRole, Guid requesterUserId, Guid orderCustomerId)
    {
        return requesterRole switch
        {
            UserRole.Admin => true,
            UserRole.Customer => requesterUserId == orderCustomerId,
            _ => false
        };
    }
}
