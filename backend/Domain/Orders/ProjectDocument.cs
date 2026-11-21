using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Domain.Orders;

public sealed class ProjectDocument
{
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }

    public Guid UploadedByUserId { get; set; }

    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [MaxLength(128)]
    public string ContentType { get; set; } = string.Empty;

    [MaxLength(512)]
    public string StorageKey { get; set; } = string.Empty;

    public long Length { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
