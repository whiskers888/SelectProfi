namespace SelectProfi.backend.Application.Orders.GetOrderSpecializations;

public sealed class GetOrderSpecializationsResult
{
    public IReadOnlyList<GetOrderSpecializationsItemResult> Items { get; init; } = [];
}

public sealed class GetOrderSpecializationsItemResult
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public bool IsActive { get; init; }

    public int SortOrder { get; init; }

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
