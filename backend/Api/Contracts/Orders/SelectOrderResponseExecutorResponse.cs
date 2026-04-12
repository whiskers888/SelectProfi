namespace SelectProfi.backend.Contracts.Orders;

public sealed class SelectOrderResponseExecutorResponse
{
    public Guid OrderId { get; init; }

    public Guid ExecutorId { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
