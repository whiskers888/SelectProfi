namespace SelectProfi.backend.Application.Orders.CreateOrder;

public enum CreateOrderErrorCode
{
    None = 0,
    CustomerNotFound = 1,
    Conflict = 2,
    RequestedCandidatesCountTooLow = 3,
    CustomerCompanyNameMissing = 4,
    // @dvnull: Добавлен код ошибки отсутствующей/неактивной специализации из справочника.
    SpecializationNotFound = 5
}
