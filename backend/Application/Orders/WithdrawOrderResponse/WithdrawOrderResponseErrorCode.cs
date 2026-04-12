namespace SelectProfi.backend.Application.Orders.WithdrawOrderResponse;

public enum WithdrawOrderResponseErrorCode
{
    None = 0,
    NotFound = 1,
    Forbidden = 2,
    CannotWithdraw = 3,
    Conflict = 4
}
