using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.SetOrderFavorite;

public sealed class SetOrderFavoriteCommand : ICommand<SetOrderFavoriteResult>
{
    public Guid OrderId { get; init; }
    public Guid RequesterUserId { get; init; }
    public UserRole RequesterRole { get; init; }
    public bool IsFavorite { get; init; }
}
