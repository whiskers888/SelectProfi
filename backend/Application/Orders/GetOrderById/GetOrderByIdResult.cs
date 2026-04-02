namespace SelectProfi.backend.Application.Orders.GetOrderById;

public sealed class GetOrderByIdResult
{
    public GetOrderByIdErrorCode ErrorCode { get; init; } = GetOrderByIdErrorCode.None;

    public Guid OrderId { get; init; }

    public Guid CustomerId { get; init; }

    public Guid? ExecutorId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
