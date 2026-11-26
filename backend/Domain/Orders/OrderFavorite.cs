using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Domain.Orders;

public sealed class OrderFavorite
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public Guid ExecutorId { get; set; }
    public User Executor { get; set; } = null!;
    public DateTime CreatedAtUtc { get; set; }
}
