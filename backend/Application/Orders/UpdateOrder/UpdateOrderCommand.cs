using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.UpdateOrder;

public sealed class UpdateOrderCommand : ICommand<UpdateOrderResult>
{
    public Guid OrderId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }

    public string? Title { get; init; }

    public string? Description { get; init; }

    public Guid? ExecutorId { get; init; }

    public OrderStatus? Status { get; init; }
}
