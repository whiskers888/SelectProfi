using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.RespondToOrder;

public sealed class RespondToOrderResult
{
    public RespondToOrderErrorCode ErrorCode { get; init; } = RespondToOrderErrorCode.None;

    public Guid OrderId { get; init; }

    public Guid ExecutorId { get; init; }

    public OrderResponseStatus Status { get; init; } = OrderResponseStatus.Pending;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
