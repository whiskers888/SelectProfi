namespace SelectProfi.backend.Domain.Orders;

public static class OrderExchangeTerms
{
    public static bool AreValid(Order order) =>
        (order.WorkMode is null or "Remote" or "Office" or "Hybrid") &&
        (!order.SalaryMin.HasValue || order.SalaryMin >= 0) &&
        (!order.SalaryMax.HasValue || order.SalaryMax >= 0) &&
        (!order.SalaryMin.HasValue || !order.SalaryMax.HasValue || order.SalaryMin <= order.SalaryMax) &&
        (!order.FulfillmentDays.HasValue || order.FulfillmentDays > 0) &&
        (!order.WarrantyMonths.HasValue || order.WarrantyMonths >= 0) &&
        (!order.GuaranteeReward.HasValue || order.GuaranteeReward >= 0) &&
        (order.GuaranteeReward is null or 0 || order.WarrantyMonths > 0);
}
