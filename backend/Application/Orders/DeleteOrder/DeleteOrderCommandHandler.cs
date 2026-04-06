using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.DeleteOrder;

public sealed class DeleteOrderCommandHandler(IDeleteOrderPersistence persistence)
    : ICommandHandler<DeleteOrderCommand, DeleteOrderResult>
{
    public async Task<DeleteOrderResult> HandleAsync(DeleteOrderCommand command, CancellationToken cancellationToken)
    {
        var order = await persistence.FindActiveByIdAsync(command.OrderId, cancellationToken);
        if (order is null)
            return new DeleteOrderResult { ErrorCode = DeleteOrderErrorCode.NotFound };

        if (!OrderAccessRules.CanManageOrder(command.RequesterRole, command.RequesterUserId, order.CustomerId))
            return new DeleteOrderResult { ErrorCode = DeleteOrderErrorCode.Forbidden };

        var hasActiveVacancy = await persistence.HasActiveVacancyAsync(order.Id, cancellationToken);
        if (hasActiveVacancy)
            return new DeleteOrderResult { ErrorCode = DeleteOrderErrorCode.HasActiveVacancy };

        var utcNow = DateTime.UtcNow;
        order.DeletedAtUtc = utcNow;
        order.UpdatedAtUtc = utcNow;

        var saveResult = await persistence.SaveChangesAsync(cancellationToken);
        if (saveResult == DeleteOrderPersistenceResult.Conflict)
            return new DeleteOrderResult { ErrorCode = DeleteOrderErrorCode.Conflict };

        return new DeleteOrderResult { ErrorCode = DeleteOrderErrorCode.None };
    }
}
