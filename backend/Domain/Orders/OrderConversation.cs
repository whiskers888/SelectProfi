using System.ComponentModel.DataAnnotations.Schema;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Domain.Orders;

/// <summary>
/// A private conversation between the customer and the executor assigned to an order.
/// The executor id is stored as an assignment snapshot so a later executor cannot read
/// messages exchanged by a previous executor.
/// </summary>
public sealed class OrderConversation
{
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ExecutorId { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    [ForeignKey(nameof(OrderId))]
    public Order Order { get; set; } = null!;

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    [ForeignKey(nameof(ExecutorId))]
    public User Executor { get; set; } = null!;
}
