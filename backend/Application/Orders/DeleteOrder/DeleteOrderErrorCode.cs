namespace SelectProfi.backend.Application.Orders.DeleteOrder;

public enum DeleteOrderErrorCode
{
    None = 0,
    NotFound = 1,
    Forbidden = 2,
    HasActiveVacancy = 3,
    Conflict = 4
}
