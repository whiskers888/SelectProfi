namespace SelectProfi.backend.Application.Orders.CreateOrder;

public enum CreateOrderErrorCode
{
    None = 0,
    CustomerNotFound = 1,
    Conflict = 2,
    RequestedCandidatesCountTooLow = 3,
    CustomerCompanyNameMissing = 4
}
