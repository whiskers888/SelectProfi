namespace SelectProfi.backend.Contracts.Orders;

public sealed class OrderResponse
{
    public Guid Id { get; init; }

    public Guid CustomerId { get; init; }

    public Guid? ExecutorId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
