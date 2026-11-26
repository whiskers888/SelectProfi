using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetOrders;

public sealed class GetOrdersQuery : IQuery<GetOrdersResult>
{
    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }

    public int Limit { get; init; }

    public int Offset { get; init; }

    public bool IncludeArchived { get; init; }
    public bool ExchangeOnly { get; init; }
    public string? Search { get; init; }
    public string? Location { get; init; }
    public Guid? SpecializationId { get; init; }
    public string? WorkMode { get; init; }
    public bool? HasWarranty { get; init; }
    public decimal? MinimumReward { get; init; }
    public decimal DefaultServiceCommissionRate { get; init; }
    public bool FavoritesOnly { get; init; }
    public bool ResponsesOnly { get; init; }
    public string? SortBy { get; init; }
}
