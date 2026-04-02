namespace SelectProfi.backend.Application.Orders.DeleteOrder;

public sealed class DeleteOrderResult
{
    public DeleteOrderErrorCode ErrorCode { get; init; } = DeleteOrderErrorCode.None;
}
