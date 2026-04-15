using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Orders.GetOrderSpecializations;

public sealed class GetOrderSpecializationsQuery : IQuery<GetOrderSpecializationsResult>
{
    public bool IncludeInactive { get; init; }
}
