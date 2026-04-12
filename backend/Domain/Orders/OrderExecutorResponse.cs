using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Domain.Orders;

public sealed class OrderExecutorResponse
{
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }

    [ForeignKey(nameof(OrderId))]
    public Order Order { get; set; } = null!;

    public Guid ExecutorId { get; set; }

    [ForeignKey(nameof(ExecutorId))]
    public User Executor { get; set; } = null!;

    public OrderResponseStatus Status { get; set; } = OrderResponseStatus.Pending;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}
