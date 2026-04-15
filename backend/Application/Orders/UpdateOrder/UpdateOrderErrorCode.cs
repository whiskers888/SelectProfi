namespace SelectProfi.backend.Application.Orders.UpdateOrder;

public enum UpdateOrderErrorCode
{
    None = 0,
    NotFound = 1,
    Forbidden = 2,
    Conflict = 3,
    ExecutorNotFound = 4,
    // @dvnull: Добавлен код ошибки отсутствующей/неактивной специализации из справочника.
    SpecializationNotFound = 5
}
