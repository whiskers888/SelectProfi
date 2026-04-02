using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Orders.CreateOrder;

public sealed class CreateOrderCommand : ICommand<CreateOrderResult>
{
    public Guid CustomerId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;
}
