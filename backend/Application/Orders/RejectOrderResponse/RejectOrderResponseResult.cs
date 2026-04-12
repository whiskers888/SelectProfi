using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.RejectOrderResponse;

public sealed class RejectOrderResponseResult
{
    public RejectOrderResponseErrorCode ErrorCode { get; init; } = RejectOrderResponseErrorCode.None;

    public Guid OrderId { get; init; }

    public Guid ExecutorId { get; init; }

    public OrderResponseStatus Status { get; init; } = OrderResponseStatus.Rejected;

    public DateTime UpdatedAtUtc { get; init; }
}
