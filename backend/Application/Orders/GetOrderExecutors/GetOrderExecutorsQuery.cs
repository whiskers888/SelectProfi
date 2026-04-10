using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetOrderExecutors;

public sealed class GetOrderExecutorsQuery : IQuery<GetOrderExecutorsResult>
{
    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
