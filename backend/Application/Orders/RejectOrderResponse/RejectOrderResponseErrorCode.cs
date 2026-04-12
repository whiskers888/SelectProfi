namespace SelectProfi.backend.Application.Orders.RejectOrderResponse;

public enum RejectOrderResponseErrorCode
{
    None = 0,
    NotFound = 1,
    Forbidden = 2,
    ResponseNotFound = 3,
    NotAvailable = 4,
    CannotReject = 5,
    Conflict = 6
}
