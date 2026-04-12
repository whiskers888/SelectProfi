namespace SelectProfi.backend.Application.Orders.CreateOrder;

public sealed class OrderCandidateRequirementsOptions
{
    public const string SectionName = "OrderCandidateRequirements";

    public int MinRequestedCandidatesCount { get; init; } = 3;
}

