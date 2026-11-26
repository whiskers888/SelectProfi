using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.SetOrderFavorite;

public sealed class SetOrderFavoriteCommandHandler(ISetOrderFavoritePersistence persistence)
    : ICommandHandler<SetOrderFavoriteCommand, SetOrderFavoriteResult>
{
    public async Task<SetOrderFavoriteResult> HandleAsync(SetOrderFavoriteCommand command, CancellationToken cancellationToken)
    {
        if (command.RequesterRole != UserRole.Executor)
            return new SetOrderFavoriteResult { ErrorCode = SetOrderFavoriteErrorCode.Forbidden };

        var order = await persistence.FindOrderAsync(command.OrderId, cancellationToken);
        if (order is null)
            return new SetOrderFavoriteResult { ErrorCode = SetOrderFavoriteErrorCode.NotFound };

        if (command.IsFavorite &&
            (order.DeletedAtUtc is not null || order.Status != OrderStatus.Active ||
             (order.ExecutorId.HasValue && order.ExecutorId != command.RequesterUserId)))
            return new SetOrderFavoriteResult { ErrorCode = SetOrderFavoriteErrorCode.NotFound };

        await persistence.SetAsync(order.Id, command.RequesterUserId, command.IsFavorite, cancellationToken);
        return new SetOrderFavoriteResult { OrderId = order.Id, IsFavorite = command.IsFavorite };
    }
}
