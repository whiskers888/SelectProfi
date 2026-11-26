using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.SetOrderFavorite;

public interface ISetOrderFavoritePersistence
{
    Task<Order?> FindOrderAsync(Guid orderId, CancellationToken cancellationToken);
    Task SetAsync(Guid orderId, Guid executorId, bool isFavorite, CancellationToken cancellationToken);
}
