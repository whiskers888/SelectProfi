using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetOrderResponses;

public sealed class GetOrderResponsesQuery : IQuery<GetOrderResponsesResult>
{
    public Guid OrderId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
