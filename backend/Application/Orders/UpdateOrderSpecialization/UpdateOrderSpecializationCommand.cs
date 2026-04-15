using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Orders.UpdateOrderSpecialization;

public sealed class UpdateOrderSpecializationCommand : ICommand<UpdateOrderSpecializationResult>
{
    public Guid SpecializationId { get; init; }

    public string? Name { get; init; }

    public bool? IsActive { get; init; }

    public int? SortOrder { get; init; }
}
