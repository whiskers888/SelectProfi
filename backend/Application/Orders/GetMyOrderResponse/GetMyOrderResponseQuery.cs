using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetMyOrderResponse;

public sealed class GetMyOrderResponseQuery : IQuery<GetMyOrderResponseResult>
{
    public Guid OrderId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
