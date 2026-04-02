namespace SelectProfi.backend.Contracts.Orders;

public sealed class OrderListResponse
{
    public IReadOnlyList<OrderResponse> Items { get; init; } = [];

    public int Limit { get; init; }

    public int Offset { get; init; }
}
