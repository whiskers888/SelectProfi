namespace SelectProfi.backend.Application.Orders.CreateOrder;

using SelectProfi.backend.Domain.Orders;

public sealed class CreateOrderResult
{
    public CreateOrderErrorCode ErrorCode { get; init; } = CreateOrderErrorCode.None;

    public Guid OrderId { get; init; }

    public Guid CustomerId { get; init; }

    public Guid? ExecutorId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public OrderStatus Status { get; init; } = OrderStatus.Active;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
