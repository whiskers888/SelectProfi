namespace SelectProfi.backend.Application.Orders.GetOrderSpecializations;

public interface IGetOrderSpecializationsPersistence
{
    Task<IReadOnlyList<GetOrderSpecializationsItemPersistence>> FindAsync(
        bool includeInactive,
        CancellationToken cancellationToken);
}

public sealed class GetOrderSpecializationsItemPersistence
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public bool IsActive { get; init; }

    public int SortOrder { get; init; }

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
