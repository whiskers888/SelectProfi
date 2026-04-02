using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetOrders;

public sealed class GetOrdersQuery : IQuery<GetOrdersResult>
{
    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }

    public int Limit { get; init; }

    public int Offset { get; init; }
}
