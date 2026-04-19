using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetMyOrders;

public sealed class GetMyOrdersQuery : IQuery<GetOrdersResult>
{
    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }

    public int Limit { get; init; }

    public int Offset { get; init; }

    public bool IncludeArchived { get; init; }
}

