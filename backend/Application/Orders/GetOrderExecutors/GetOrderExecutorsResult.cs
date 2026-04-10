namespace SelectProfi.backend.Application.Orders.GetOrderExecutors;

public sealed class GetOrderExecutorsResult
{
    public GetOrderExecutorsErrorCode ErrorCode { get; init; }

    public IReadOnlyList<GetOrderExecutorsItemResult> Items { get; init; } = [];
}

public sealed class GetOrderExecutorsItemResult
{
    public Guid ExecutorId { get; init; }

    public string FullName { get; init; } = string.Empty;
}
