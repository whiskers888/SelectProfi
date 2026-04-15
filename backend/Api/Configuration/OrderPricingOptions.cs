namespace SelectProfi.backend.Configuration;

public sealed class OrderPricingOptions
{
    public const string SectionName = "OrderPricing";

    public decimal ServiceCommissionPercent { get; init; } = 0.15m;
}

