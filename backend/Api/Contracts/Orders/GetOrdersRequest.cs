using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Orders;

public sealed class GetOrdersRequest
{
    [Range(1, 100)]
    public int Limit { get; init; } = 20;

    [Range(0, int.MaxValue)]
    public int Offset { get; init; }

    public bool IncludeArchived { get; init; }
    public bool ExchangeOnly { get; init; }

    [MaxLength(200)] public string? Search { get; init; }
    [MaxLength(255)] public string? Location { get; init; }
    public Guid? SpecializationId { get; init; }
    [RegularExpression("^(Remote|Office|Hybrid)$")] public string? WorkMode { get; init; }
    public bool? HasWarranty { get; init; }
    [Range(typeof(decimal), "0", "79228162514264337593543950335")] public decimal? MinimumReward { get; init; }
    public bool FavoritesOnly { get; init; }
    public bool ResponsesOnly { get; init; }
    [RegularExpression("^(new|salary|reward|bonus)$")] public string? SortBy { get; init; }
}
