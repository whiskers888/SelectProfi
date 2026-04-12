using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.WithdrawOrderResponse;

public sealed class WithdrawOrderResponseCommand : ICommand<WithdrawOrderResponseResult>
{
    public Guid OrderId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
