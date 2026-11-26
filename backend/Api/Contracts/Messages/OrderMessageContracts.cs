using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Messages;

public sealed record OrderConversationListResponse(IReadOnlyList<OrderConversationResponse> Items);

public sealed record OrderConversationResponse(
    Guid OrderId,
    string OrderTitle,
    Guid ParticipantId,
    string ParticipantName,
    string ParticipantRole,
    string? LastMessage,
    DateTime? LastMessageAtUtc,
    int UnreadCount);

public sealed record OrderMessageListResponse(IReadOnlyList<OrderMessageResponse> Items);

public sealed record OrderMessageResponse(
    Guid Id,
    Guid SenderUserId,
    string SenderName,
    string Text,
    DateTime CreatedAtUtc,
    DateTime? ReadAtUtc,
    string? AttachmentFileName,
    string? AttachmentContentType,
    long? AttachmentLength);

public sealed class SendOrderMessageRequest
{
    [StringLength(4000)]
    public string? Text { get; set; }

    public IFormFile? File { get; set; }
}
