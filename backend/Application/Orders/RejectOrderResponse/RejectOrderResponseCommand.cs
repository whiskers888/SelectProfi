using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.RejectOrderResponse;

public sealed class RejectOrderResponseCommand : ICommand<RejectOrderResponseResult>
{
    public Guid OrderId { get; init; }

    public Guid ExecutorId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
