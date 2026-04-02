using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetOrders;

public interface IGetOrdersPersistence
{
    Task<IReadOnlyList<Order>> FindVisibleActiveOrdersAsync(
        Guid requesterUserId,
        UserRole requesterRole,
        int limit,
        int offset,
        CancellationToken cancellationToken);
}
