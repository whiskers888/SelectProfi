using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.GetMyOrderResponse;

public sealed class GetMyOrderResponseResult
{
    public GetMyOrderResponseErrorCode ErrorCode { get; init; } = GetMyOrderResponseErrorCode.None;

    public Guid OrderId { get; init; }

    public bool HasResponse { get; init; }

    public OrderResponseStatus? Status { get; init; }

    public DateTime? UpdatedAtUtc { get; init; }
}
