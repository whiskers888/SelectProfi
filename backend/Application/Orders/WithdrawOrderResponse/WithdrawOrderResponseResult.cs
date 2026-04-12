using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.WithdrawOrderResponse;

public sealed class WithdrawOrderResponseResult
{
    public WithdrawOrderResponseErrorCode ErrorCode { get; init; } = WithdrawOrderResponseErrorCode.None;

    public Guid OrderId { get; init; }

    public Guid ExecutorId { get; init; }

    public OrderResponseStatus Status { get; init; } = OrderResponseStatus.Withdrawn;

    public DateTime UpdatedAtUtc { get; init; }
}
