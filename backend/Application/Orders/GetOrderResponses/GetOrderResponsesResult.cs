using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.GetOrderResponses;

public sealed class GetOrderResponsesResult
{
    public GetOrderResponsesErrorCode ErrorCode { get; init; } = GetOrderResponsesErrorCode.None;

    public IReadOnlyList<GetOrderResponsesItemResult> Items { get; init; } = [];
}

public sealed class GetOrderResponsesItemResult
{
    public Guid ExecutorId { get; init; }

    public string ExecutorFullName { get; init; } = string.Empty;

    public string? ExecutorGrade { get; init; }

    public string? ExecutorProjectTitle { get; init; }

    public string? ExecutorProjectCompanyName { get; init; }

    public string? ExecutorExperienceSummary { get; init; }

    public OrderResponseStatus Status { get; init; } = OrderResponseStatus.Pending;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
