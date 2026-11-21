using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Domain.Orders;

public sealed class ProjectActivity
{
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }

    public Guid ActorUserId { get; set; }

    [MaxLength(80)]
    public string Action { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; }
}
