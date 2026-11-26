using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetOrders;

public interface IGetOrdersPersistence
{
    Task<IReadOnlyList<Order>> FindVisibleOrdersAsync(
        Guid requesterUserId,
        UserRole requesterRole,
        bool includeArchived,
        bool exchangeOnly,
        string? search,
        string? location,
        Guid? specializationId,
        string? workMode,
        bool? hasWarranty,
        decimal? minimumReward,
        decimal defaultServiceCommissionRate,
        bool favoritesOnly,
        bool responsesOnly,
        string? sortBy,
        int limit,
        int offset,
        CancellationToken cancellationToken);

    Task<int> CountVisibleOrdersAsync(
        Guid requesterUserId, UserRole requesterRole, bool includeArchived, bool exchangeOnly,
        string? search, string? location, Guid? specializationId, string? workMode,
        bool? hasWarranty, decimal? minimumReward, decimal defaultServiceCommissionRate,
        bool favoritesOnly, bool responsesOnly,
        CancellationToken cancellationToken);

    Task<IReadOnlyDictionary<Guid, OrderExchangeState>> FindExchangeStatesAsync(
        Guid executorId, IReadOnlyCollection<Guid> orderIds, CancellationToken cancellationToken);
}

public sealed class OrderExchangeState
{
    public bool IsFavorite { get; init; }
    public OrderResponseStatus? MyResponseStatus { get; init; }
    public string? MyResponseMessage { get; init; }
}
