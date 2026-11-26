using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders;
using SelectProfi.backend.Application.Orders.ProjectWorkspace;
using SelectProfi.backend.Application.Orders.Messages;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Contracts.Messages;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutor)]
[Route("api/messages")]
[Produces("application/json", "application/problem+json")]
public sealed class OrderMessagesController(
    AppDbContext dbContext,
    IProjectDocumentStorage attachmentStorage,
    IOrderConversationPersistence conversationPersistence) : AuthorizedControllerBase
{
    [HttpGet("conversations")]
    [ProducesResponseType(typeof(OrderConversationListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetConversations(CancellationToken cancellationToken)
    {
        if (RequesterRole is not (UserRole.Customer or UserRole.Executor))
            return Forbid();

        var orders = await dbContext.Orders
            .AsNoTracking()
            .Include(order => order.Customer)
            .Include(order => order.Executor)
            .Where(order => order.DeletedAtUtc == null && order.ExecutorId != null &&
                (order.CustomerId == RequesterUserId || order.ExecutorId == RequesterUserId))
            .OrderByDescending(order => order.UpdatedAtUtc)
            .ToListAsync(cancellationToken);

        var orderIds = orders.Select(order => order.Id).ToArray();
        var currentAssignments = orders.ToDictionary(order => order.Id);
        var storedConversations = await dbContext.OrderConversations
            .AsNoTracking()
            .Where(conversation => orderIds.Contains(conversation.OrderId))
            .ToListAsync(cancellationToken);
        var conversations = storedConversations
            .Where(conversation => currentAssignments.TryGetValue(conversation.OrderId, out var order) &&
                OrderConversationAccessRules.CanReadConversation(RequesterRole, RequesterUserId, order, conversation))
            .ToDictionary(conversation => conversation.OrderId);
        var conversationIds = conversations.Values.Select(conversation => conversation.Id).ToArray();
        var messages = await dbContext.OrderChatMessages
            .AsNoTracking()
            .Where(message => conversationIds.Contains(message.ConversationId))
            .GroupBy(message => message.ConversationId)
            .Select(group => new
            {
                ConversationId = group.Key,
                Last = group.OrderByDescending(message => message.CreatedAtUtc).First(),
                Unread = group.Count(message => message.SenderUserId != RequesterUserId && message.ReadAtUtc == null)
            })
            .ToListAsync(cancellationToken);
        var messageByConversation = messages.ToDictionary(row => row.ConversationId);

        return Ok(new OrderConversationListResponse(orders.Select(order =>
        {
            conversations.TryGetValue(order.Id, out var conversation);
            var last = conversation is not null && messageByConversation.TryGetValue(conversation.Id, out var summary)
                ? summary
                : null;
            var participant = RequesterRole == UserRole.Customer ? order.Executor! : order.Customer;
            return new OrderConversationResponse(
                order.Id,
                order.Title,
                participant.Id,
                $"{participant.FirstName} {participant.LastName}".Trim(),
                RequesterRole == UserRole.Customer ? UserRole.Executor.ToString() : UserRole.Customer.ToString(),
                last?.Last.Text,
                last?.Last.CreatedAtUtc,
                last?.Unread ?? 0);
        }).ToArray()));
    }

    [HttpGet("orders/{orderId:guid}")]
    [ProducesResponseType(typeof(OrderMessageListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMessages(Guid orderId, CancellationToken cancellationToken)
    {
        var conversation = await GetAuthorizedConversationAsync(orderId, cancellationToken);
        if (conversation is null)
            return await IsOrderAccessibleAsync(orderId, cancellationToken) ? Ok(new OrderMessageListResponse([])) : Forbid();

        var unread = await dbContext.OrderChatMessages
            .Where(message => message.ConversationId == conversation.Id &&
                message.SenderUserId != RequesterUserId && message.ReadAtUtc == null)
            .ToListAsync(cancellationToken);
        var now = DateTime.UtcNow;
        foreach (var message in unread)
            message.ReadAtUtc = now;
        if (unread.Count > 0)
            await dbContext.SaveChangesAsync(cancellationToken);

        var messages = await dbContext.OrderChatMessages
            .AsNoTracking()
            .Where(message => message.ConversationId == conversation.Id)
            .OrderBy(message => message.CreatedAtUtc)
            .Select(message => new OrderMessageResponse(
                message.Id,
                message.SenderUserId,
                $"{message.Sender.FirstName} {message.Sender.LastName}".Trim(),
                message.Text,
                message.CreatedAtUtc,
                message.ReadAtUtc,
                message.AttachmentFileName,
                message.AttachmentContentType,
                message.AttachmentLength))
            .ToListAsync(cancellationToken);

        return Ok(new OrderMessageListResponse(messages));
    }

    [HttpPost("orders/{orderId:guid}")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(OrderMessageAttachmentPolicy.MaximumLength + 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = OrderMessageAttachmentPolicy.MaximumLength + 1024 * 1024)]
    [ProducesResponseType(typeof(OrderMessageResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendMessage(
        Guid orderId,
        [FromForm] SendOrderMessageRequest request,
        CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders
            .Include(item => item.Customer)
            .Include(item => item.Executor)
            .SingleOrDefaultAsync(item => item.Id == orderId && item.DeletedAtUtc == null, cancellationToken);
        if (order is null)
            return NotFound();
        if (!CanCommunicate(order))
            return Forbid();

        var text = request.Text?.Trim() ?? string.Empty;
        var file = request.File;
        string? attachmentName = null;
        string? attachmentType = null;
        string? attachmentKey = null;
        long? attachmentLength = null;
        var extension = string.Empty;
        if (file is not null)
        {
            if (!OrderMessageAttachmentPolicy.TryNormalize(file.FileName, file.Length, out attachmentName!, out extension, out attachmentType!))
                return BadRequest(new ProblemDetails { Title = "Недопустимый файл", Detail = "Выберите документ, изображение, аудио или видео размером до 25 МБ." });
            using var content = file.OpenReadStream();
            attachmentKey = await attachmentStorage.SaveAsync(orderId, content, extension, attachmentType, cancellationToken);
            attachmentLength = file.Length;
        }
        if (text.Length == 0 && file is null)
            return BadRequest(new ProblemDetails { Title = "Пустое сообщение", Detail = "Напишите сообщение или прикрепите файл." });

        OrderChatMessage message;
        try
        {
            var conversation = await conversationPersistence.GetOrCreateAsync(
                order.Id,
                order.CustomerId,
                order.ExecutorId!.Value,
                DateTime.UtcNow,
                cancellationToken);

            message = new OrderChatMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                SenderUserId = RequesterUserId,
                Text = text,
                AttachmentFileName = attachmentName,
                AttachmentContentType = attachmentType,
                AttachmentStorageKey = attachmentKey,
                AttachmentLength = attachmentLength,
                CreatedAtUtc = DateTime.UtcNow
            };
            dbContext.OrderChatMessages.Add(message);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            if (attachmentKey is not null)
            {
                try
                {
                    await attachmentStorage.DeleteAsync(attachmentKey, CancellationToken.None);
                }
                catch
                {
                    // Preserve the database error; orphaned storage objects can be cleaned up operationally.
                }
            }

            throw;
        }

        var sender = RequesterRole == UserRole.Customer ? order.Customer : order.Executor!;
        var response = new OrderMessageResponse(
            message.Id,
            message.SenderUserId,
            $"{sender.FirstName} {sender.LastName}".Trim(),
            message.Text,
            message.CreatedAtUtc,
            message.ReadAtUtc,
            message.AttachmentFileName,
            message.AttachmentContentType,
            message.AttachmentLength);
        return Created($"/api/messages/orders/{orderId}", response);
    }

    [HttpGet("orders/{orderId:guid}/messages/{messageId:guid}/attachment")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadAttachment(Guid orderId, Guid messageId, CancellationToken cancellationToken)
    {
        var conversation = await GetAuthorizedConversationAsync(orderId, cancellationToken);
        if (conversation is null)
            return await IsOrderAccessibleAsync(orderId, cancellationToken) ? NotFound() : Forbid();
        var message = await dbContext.OrderChatMessages.AsNoTracking().SingleOrDefaultAsync(
            item => item.Id == messageId && item.ConversationId == conversation.Id &&
                item.AttachmentStorageKey != null && item.AttachmentFileName != null && item.AttachmentContentType != null,
            cancellationToken);
        if (message is null)
            return NotFound();

        var content = await attachmentStorage.ReadAsync(message.AttachmentStorageKey!, cancellationToken);
        return File(content, message.AttachmentContentType!, message.AttachmentFileName!);
    }

    private async Task<OrderConversation?> GetAuthorizedConversationAsync(Guid orderId, CancellationToken cancellationToken)
    {
        if (RequesterRole is not (UserRole.Customer or UserRole.Executor))
            return null;
        var order = await dbContext.Orders.AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == orderId && item.DeletedAtUtc == null, cancellationToken);
        if (order is null || !OrderConversationAccessRules.CanStartOrReadOrderConversation(RequesterRole, RequesterUserId, order))
            return null;

        var conversation = await dbContext.OrderConversations
            .SingleOrDefaultAsync(item => item.OrderId == orderId && item.CustomerId == order.CustomerId &&
                item.ExecutorId == order.ExecutorId, cancellationToken);
        return conversation is not null && OrderConversationAccessRules.CanReadConversation(
            RequesterRole, RequesterUserId, order, conversation) ? conversation : null;
    }

    private async Task<bool> IsOrderAccessibleAsync(Guid orderId, CancellationToken cancellationToken) =>
        RequesterRole is UserRole.Customer or UserRole.Executor &&
        await dbContext.Orders.AsNoTracking().AnyAsync(
            order => order.Id == orderId && order.DeletedAtUtc == null &&
                order.ExecutorId != null && (order.CustomerId == RequesterUserId || order.ExecutorId == RequesterUserId),
            cancellationToken);

    private bool CanCommunicate(Order order) =>
        OrderConversationAccessRules.CanStartOrReadOrderConversation(RequesterRole, RequesterUserId, order);
}
