namespace SelectProfi.backend.Contracts.Orders;

public sealed class OrderExecutorListResponse
{
    public IReadOnlyList<OrderExecutorResponse> Items { get; init; } = [];
}

public sealed class OrderExecutorResponse
{
    public Guid Id { get; init; }

    public string FullName { get; init; } = string.Empty;
}
