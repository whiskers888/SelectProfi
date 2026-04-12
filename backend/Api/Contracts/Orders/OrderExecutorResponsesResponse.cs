namespace SelectProfi.backend.Contracts.Orders;

public sealed class OrderExecutorResponsesResponse
{
    public IReadOnlyList<OrderExecutorResponseItemResponse> Items { get; init; } = [];
}

public sealed class OrderExecutorResponseItemResponse
{
    public Guid ExecutorId { get; init; }

    public string ExecutorFullName { get; init; } = string.Empty;

    public string? ExecutorGrade { get; init; }

    public string? ExecutorProjectTitle { get; init; }

    public string? ExecutorProjectCompanyName { get; init; }

    public string? ExecutorExperienceSummary { get; init; }

    public OrderExecutorResponseStatusContract Status { get; init; } = OrderExecutorResponseStatusContract.Pending;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
