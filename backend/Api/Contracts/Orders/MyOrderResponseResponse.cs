namespace SelectProfi.backend.Contracts.Orders;

public sealed class MyOrderResponseResponse
{
    public Guid OrderId { get; init; }

    public bool HasResponse { get; init; }

    public OrderExecutorResponseStatusContract? Status { get; init; }

    public DateTime? UpdatedAtUtc { get; init; }
}
