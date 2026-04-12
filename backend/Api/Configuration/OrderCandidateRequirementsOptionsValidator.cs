using FluentValidation;
using SelectProfi.backend.Application.Orders.CreateOrder;

namespace SelectProfi.backend.Configuration;

public sealed class OrderCandidateRequirementsOptionsValidator : AbstractValidator<OrderCandidateRequirementsOptions>
{
    public OrderCandidateRequirementsOptionsValidator()
    {
        RuleFor(options => options.MinRequestedCandidatesCount)
            .GreaterThanOrEqualTo(3)
            .WithMessage("OrderCandidateRequirements:MinRequestedCandidatesCount must be greater than or equal to 3.");
    }
}

