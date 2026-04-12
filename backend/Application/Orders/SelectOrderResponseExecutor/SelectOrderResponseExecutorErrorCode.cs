namespace SelectProfi.backend.Application.Orders.SelectOrderResponseExecutor;

public enum SelectOrderResponseExecutorErrorCode
{
    None = 0,
    NotFound = 1,
    Forbidden = 2,
    ResponseNotFound = 3,
    NotAvailable = 4,
    Conflict = 5
}
