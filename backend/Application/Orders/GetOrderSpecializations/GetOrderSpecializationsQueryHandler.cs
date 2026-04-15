using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Orders.GetOrderSpecializations;

public sealed class GetOrderSpecializationsQueryHandler(IGetOrderSpecializationsPersistence persistence)
    : IQueryHandler<GetOrderSpecializationsQuery, GetOrderSpecializationsResult>
{
    public async Task<GetOrderSpecializationsResult> HandleAsync(
        GetOrderSpecializationsQuery query,
        CancellationToken cancellationToken)
    {
        var items = await persistence.FindAsync(query.IncludeInactive, cancellationToken);

        return new GetOrderSpecializationsResult
        {
            Items = items.Select(item => new GetOrderSpecializationsItemResult
            {
                Id = item.Id,
                Name = item.Name,
                IsActive = item.IsActive,
                SortOrder = item.SortOrder,
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc
            }).ToArray()
        };
    }
}
