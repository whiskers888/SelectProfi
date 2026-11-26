using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Domain.Orders;

public sealed class OrderChatMessage
{
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; }

    public Guid ConversationId { get; set; }
    public Guid SenderUserId { get; set; }

    [MaxLength(4000)]
    public string Text { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? AttachmentFileName { get; set; }

    [MaxLength(128)]
    public string? AttachmentContentType { get; set; }

    [MaxLength(512)]
    public string? AttachmentStorageKey { get; set; }

    public long? AttachmentLength { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ReadAtUtc { get; set; }

    [ForeignKey(nameof(ConversationId))]
    public OrderConversation Conversation { get; set; } = null!;

    [ForeignKey(nameof(SenderUserId))]
    public User Sender { get; set; } = null!;
}
