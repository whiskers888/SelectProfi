using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Domain.Orders;

/// <summary>
/// A meeting planned by either member of an assigned order. Participant ids are
/// snapshots so changing an assignment does not expose a previous meeting to a new user.
/// </summary>
public sealed class OrderMeeting
{
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ExecutorId { get; set; }
    public Guid CreatedByUserId { get; set; }

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public OrderMeetingFormat Format { get; set; }
    public DateTime StartsAtUtc { get; set; }

    [MaxLength(1000)]
    public string Note { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; }

    [ForeignKey(nameof(OrderId))]
    public Order Order { get; set; } = null!;

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    [ForeignKey(nameof(ExecutorId))]
    public User Executor { get; set; } = null!;

    [ForeignKey(nameof(CreatedByUserId))]
    public User CreatedBy { get; set; } = null!;
}
