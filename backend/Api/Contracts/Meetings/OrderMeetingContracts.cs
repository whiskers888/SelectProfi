using System.ComponentModel.DataAnnotations;
using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Contracts.Meetings;

public sealed record OrderMeetingListResponse(IReadOnlyList<OrderMeetingResponse> Items);

public sealed record OrderMeetingResponse(
    Guid Id,
    Guid OrderId,
    string OrderTitle,
    Guid ParticipantId,
    string ParticipantName,
    Guid CreatedByUserId,
    string Title,
    OrderMeetingFormat Format,
    DateTime StartsAtUtc,
    string Note,
    DateTime CreatedAtUtc);

public sealed class CreateOrderMeetingRequest
{
    [Required, StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    public DateTimeOffset StartsAt { get; set; }

    [EnumDataType(typeof(OrderMeetingFormat))]
    public OrderMeetingFormat Format { get; set; }

    [StringLength(1000)]
    public string? Note { get; set; }
}
