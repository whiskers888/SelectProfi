using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetOrders;

public interface IGetOrdersPersistence
{
    Task<IReadOnlyList<Order>> FindVisibleOrdersAsync(
        Guid requesterUserId,
        UserRole requesterRole,
        bool includeArchived,
        int limit,
        int offset,
        CancellationToken cancellationToken);
}
