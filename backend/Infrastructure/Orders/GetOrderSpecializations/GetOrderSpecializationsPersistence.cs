using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.GetOrderSpecializations;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.GetOrderSpecializations;

public sealed class GetOrderSpecializationsPersistence(AppDbContext dbContext) : IGetOrderSpecializationsPersistence
{
    public async Task<IReadOnlyList<GetOrderSpecializationsItemPersistence>> FindAsync(
        bool includeInactive,
        CancellationToken cancellationToken)
    {
        var query = dbContext.OrderSpecializations.AsNoTracking();
        if (!includeInactive)
            query = query.Where(item => item.IsActive);

        return await query
            .OrderBy(item => item.SortOrder)
            .ThenBy(item => item.Name)
            .Select(item => new GetOrderSpecializationsItemPersistence
            {
                Id = item.Id,
                Name = item.Name,
                IsActive = item.IsActive,
                SortOrder = item.SortOrder,
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc
            })
            .ToArrayAsync(cancellationToken);
    }
}
