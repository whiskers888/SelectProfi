using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.RespondToOrder;

public sealed class RespondToOrderCommand : ICommand<RespondToOrderResult>
{
    public Guid OrderId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
