using FluentValidation;

namespace SelectProfi.backend.Configuration;

public sealed class OrderPricingOptionsValidator : AbstractValidator<OrderPricingOptions>
{
    public OrderPricingOptionsValidator()
    {
        RuleFor(x => x.ServiceCommissionPercent)
            .InclusiveBetween(0m, 1m)
            .WithMessage("OrderPricing:ServiceCommissionPercent должен быть в диапазоне [0..1].");
    }
}

