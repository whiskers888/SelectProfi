namespace SelectProfi.backend.Application.Orders.GetOrders;

public sealed class GetOrdersResult
{
    public GetOrdersErrorCode ErrorCode { get; init; } = GetOrdersErrorCode.None;

    public IReadOnlyList<GetOrdersItemResult> Items { get; init; } = [];

    public int Limit { get; init; }

    public int Offset { get; init; }
}

public sealed class GetOrdersItemResult
{
    public Guid OrderId { get; init; }

    public Guid CustomerId { get; init; }

    public Guid? ExecutorId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
