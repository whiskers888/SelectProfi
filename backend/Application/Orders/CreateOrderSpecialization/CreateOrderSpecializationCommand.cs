using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Orders.CreateOrderSpecialization;

public sealed class CreateOrderSpecializationCommand : ICommand<CreateOrderSpecializationResult>
{
    public string Name { get; init; } = string.Empty;

    public int SortOrder { get; init; }
}
