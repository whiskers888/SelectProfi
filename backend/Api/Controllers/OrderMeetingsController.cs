using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.Messages;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Contracts.Meetings;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutor)]
[Route("api")]
[Produces("application/json", "application/problem+json")]
public sealed class OrderMeetingsController(AppDbContext dbContext, IOrderConversationPersistence conversationPersistence) : AuthorizedControllerBase
{
    [HttpGet("meetings")]
    [ProducesResponseType(typeof(OrderMeetingListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMeetings(
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        CancellationToken cancellationToken)
    {
        if (RequesterRole is not (UserRole.Customer or UserRole.Executor))
            return Forbid();
        if (from.HasValue && to.HasValue && to <= from)
            return BadRequest(new ProblemDetails { Title = "Неверный период", Detail = "Дата окончания должна быть позже даты начала." });

        var query = dbContext.OrderMeetings.AsNoTracking()
            .Include(meeting => meeting.Order)
            .Include(meeting => meeting.Customer)
            .Include(meeting => meeting.Executor)
            .Where(meeting =>
                (meeting.CustomerId == RequesterUserId || meeting.ExecutorId == RequesterUserId) &&
                meeting.Order.DeletedAtUtc == null &&
                meeting.Order.CustomerId == meeting.CustomerId &&
                meeting.Order.ExecutorId == meeting.ExecutorId);
        if (from.HasValue)
            query = query.Where(meeting => meeting.StartsAtUtc >= from.Value.UtcDateTime);
        if (to.HasValue)
            query = query.Where(meeting => meeting.StartsAtUtc < to.Value.UtcDateTime);

        var rows = await query.OrderBy(meeting => meeting.StartsAtUtc).ToListAsync(cancellationToken);
        return Ok(new OrderMeetingListResponse(rows.Select(ToResponse).ToArray()));
    }

    [HttpPost("orders/{orderId:guid}/meetings")]
    [ProducesResponseType(typeof(OrderMeetingResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateMeeting(
        Guid orderId,
        [FromBody] CreateOrderMeetingRequest request,
        CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(request.Format))
            return BadRequest(new ProblemDetails { Title = "Неизвестный формат встречи" });
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new ProblemDetails { Title = "Укажите тему встречи" });
        if (request.StartsAt <= DateTimeOffset.UtcNow)
            return BadRequest(new ProblemDetails { Title = "Укажите время в будущем", Detail = "Встречу можно запланировать только на будущее." });

        var order = await dbContext.Orders
            .Include(item => item.Customer)
            .Include(item => item.Executor)
            .SingleOrDefaultAsync(item => item.Id == orderId && item.DeletedAtUtc == null, cancellationToken);
        if (order is null)
            return NotFound();
        if (!OrderConversationAccessRules.CanStartOrReadOrderConversation(RequesterRole, RequesterUserId, order))
            return Forbid();

        var now = DateTime.UtcNow;
        var meeting = new OrderMeeting
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            ExecutorId = order.ExecutorId!.Value,
            CreatedByUserId = RequesterUserId,
            Title = request.Title.Trim(),
            Format = request.Format,
            StartsAtUtc = request.StartsAt.UtcDateTime,
            Note = request.Note?.Trim() ?? string.Empty,
            CreatedAtUtc = now
        };
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        dbContext.OrderMeetings.Add(meeting);

        var conversation = await conversationPersistence.GetOrCreateAsync(
            order.Id,
            order.CustomerId,
            order.ExecutorId!.Value,
            now,
            cancellationToken);
        var creatorName = RequesterRole == UserRole.Customer ? order.Customer : order.Executor!;
        dbContext.OrderChatMessages.Add(new OrderChatMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            SenderUserId = RequesterUserId,
            Text = $"Предложение о встрече «{meeting.Title}» на {request.StartsAt:dd.MM.yyyy HH:mm zzz} от {creatorName.FirstName} {creatorName.LastName}.",
            CreatedAtUtc = now
        });
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var response = ToResponse(meeting, order.Title, RequesterRole == UserRole.Customer ? order.Executor! : order.Customer);
        return Created($"/api/meetings/{meeting.Id}", response);
    }

    private OrderMeetingResponse ToResponse(OrderMeeting meeting) =>
        ToResponse(meeting, meeting.Order.Title, RequesterRole == UserRole.Customer ? meeting.Executor : meeting.Customer);

    private static OrderMeetingResponse ToResponse(OrderMeeting meeting, string orderTitle, User participant) =>
        new(meeting.Id, meeting.OrderId, orderTitle, participant.Id,
            $"{participant.FirstName} {participant.LastName}".Trim(), meeting.CreatedByUserId,
            meeting.Title, meeting.Format, meeting.StartsAtUtc, meeting.Note, meeting.CreatedAtUtc);
}
