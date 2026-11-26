using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.GetOrders;

public sealed class GetOrdersPersistence(AppDbContext dbContext) : IGetOrdersPersistence
{
    public async Task<IReadOnlyDictionary<Guid, OrderExchangeState>> FindExchangeStatesAsync(
        Guid executorId, IReadOnlyCollection<Guid> orderIds, CancellationToken cancellationToken)
    {
        if (orderIds.Count == 0)
            return new Dictionary<Guid, OrderExchangeState>();

        var favorites = await dbContext.OrderFavorites.AsNoTracking()
            .Where(item => item.ExecutorId == executorId && orderIds.Contains(item.OrderId))
            .Select(item => item.OrderId).ToArrayAsync(cancellationToken);
        var responses = await dbContext.OrderExecutorResponses.AsNoTracking()
            .Where(item => item.ExecutorId == executorId && orderIds.Contains(item.OrderId))
            .Select(item => new { item.OrderId, item.Status, item.Message }).ToArrayAsync(cancellationToken);

        var favoriteIds = favorites.ToHashSet();
        var responseByOrder = responses.ToDictionary(item => item.OrderId);
        return orderIds.ToDictionary(
            orderId => orderId,
            orderId => new OrderExchangeState
            {
                IsFavorite = favoriteIds.Contains(orderId),
                MyResponseStatus = responseByOrder.TryGetValue(orderId, out var response) ? response.Status : null,
                MyResponseMessage = responseByOrder.TryGetValue(orderId, out response) ? response.Message : null
            });
    }

    public async Task<IReadOnlyList<Order>> FindVisibleOrdersAsync(
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
        CancellationToken cancellationToken)
    {
        var query = BuildVisibleQuery(requesterUserId, requesterRole, includeArchived, exchangeOnly, search, location,
            specializationId, workMode, hasWarranty, minimumReward, defaultServiceCommissionRate, favoritesOnly, responsesOnly);
        query = sortBy switch
        {
            "salary" => query.OrderByDescending(order => order.SalaryMax ?? order.SalaryMin ?? 0).ThenBy(order => order.Id),
            "reward" => query.OrderByDescending(order =>
                order.Price - decimal.Round(order.Price * (order.ServiceCommissionRate ?? defaultServiceCommissionRate), 2)).ThenBy(order => order.Id),
            "bonus" => query.OrderByDescending(order => order.GuaranteeReward ?? 0).ThenBy(order => order.Id),
            _ => query.OrderByDescending(order => order.CreatedAtUtc).ThenBy(order => order.Id)
        };
        return await query
            .Skip(offset)
            .Take(limit)
            .ToArrayAsync(cancellationToken);
    }

    public Task<int> CountVisibleOrdersAsync(
        Guid requesterUserId, UserRole requesterRole, bool includeArchived, bool exchangeOnly,
        string? search, string? location, Guid? specializationId, string? workMode,
        bool? hasWarranty, decimal? minimumReward, decimal defaultServiceCommissionRate,
        bool favoritesOnly, bool responsesOnly,
        CancellationToken cancellationToken) =>
        BuildVisibleQuery(requesterUserId, requesterRole, includeArchived, exchangeOnly, search, location,
                specializationId, workMode, hasWarranty, minimumReward, defaultServiceCommissionRate, favoritesOnly, responsesOnly)
            .CountAsync(cancellationToken);

    private IQueryable<Order> BuildVisibleQuery(
        Guid requesterUserId, UserRole requesterRole, bool includeArchived, bool exchangeOnly,
        string? search, string? location, Guid? specializationId, string? workMode,
        bool? hasWarranty, decimal? minimumReward, decimal defaultServiceCommissionRate,
        bool favoritesOnly, bool responsesOnly)
    {
        var query = dbContext.Orders.AsNoTracking().AsQueryable();
        if (!includeArchived) query = query.Where(order => order.DeletedAtUtc == null);

        query = requesterRole switch
        {
            UserRole.Admin => query,
            UserRole.Customer => query.Where(order => order.CustomerId == requesterUserId),
            UserRole.Executor when responsesOnly => query.Where(order =>
                dbContext.OrderExecutorResponses.Any(response =>
                    response.OrderId == order.Id && response.ExecutorId == requesterUserId)),
            // Keep historical responses and favorites available to their executor, while the
            // default exchange contains only active, unassigned orders anyone can take.
            UserRole.Executor when favoritesOnly => query.Where(order =>
                order.ExecutorId == requesterUserId || order.ExecutorId == null),
            UserRole.Executor when exchangeOnly => query.Where(order =>
                order.Status == OrderStatus.Active && order.ExecutorId == null),
            UserRole.Executor => query.Where(order =>
                order.ExecutorId == requesterUserId || order.ExecutorId == null),
            _ => query.Where(_ => false)
        };

        if (favoritesOnly)
            query = query.Where(order => dbContext.OrderFavorites.Any(favorite =>
                favorite.OrderId == order.Id && favorite.ExecutorId == requesterUserId));
        if (!string.IsNullOrWhiteSpace(search))
        {
            var words = search.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            foreach (var word in words)
            {
                var normalizedWord = word.ToLower();
                query = query.Where(order => order.Title.ToLower().Contains(normalizedWord) ||
                    (order.CustomerCompanyName != null && order.CustomerCompanyName.ToLower().Contains(normalizedWord)) ||
                    order.Location.ToLower().Contains(normalizedWord) || order.Id.ToString().Contains(word));
            }
        }
        if (!string.IsNullOrWhiteSpace(location))
        {
            var normalizedLocation = location.ToLower();
            query = query.Where(order => order.Location.ToLower().Contains(normalizedLocation));
        }
        if (specializationId.HasValue) query = query.Where(order => order.SpecializationId == specializationId);
        if (!string.IsNullOrWhiteSpace(workMode)) query = query.Where(order => order.WorkMode == workMode);
        if (hasWarranty == true) query = query.Where(order => order.WarrantyMonths > 0);
        if (hasWarranty == false) query = query.Where(order => order.WarrantyMonths == null || order.WarrantyMonths == 0);
        if (minimumReward.HasValue) query = query.Where(order =>
            order.Price - decimal.Round(order.Price * (order.ServiceCommissionRate ?? defaultServiceCommissionRate), 2)
            >= minimumReward.Value);
        return query;
    }
}
