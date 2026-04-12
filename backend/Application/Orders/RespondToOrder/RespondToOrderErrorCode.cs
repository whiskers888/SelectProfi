namespace SelectProfi.backend.Application.Orders.RespondToOrder;

public enum RespondToOrderErrorCode
{
    None = 0,
    NotFound = 1,
    Forbidden = 2,
    NotAvailable = 3,
    AlreadyResponded = 4,
    Conflict = 5
}
