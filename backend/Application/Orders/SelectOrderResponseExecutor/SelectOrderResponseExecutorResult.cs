namespace SelectProfi.backend.Application.Orders.SelectOrderResponseExecutor;

public sealed class SelectOrderResponseExecutorResult
{
    public SelectOrderResponseExecutorErrorCode ErrorCode { get; init; } = SelectOrderResponseExecutorErrorCode.None;

    public Guid OrderId { get; init; }

    public Guid ExecutorId { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
