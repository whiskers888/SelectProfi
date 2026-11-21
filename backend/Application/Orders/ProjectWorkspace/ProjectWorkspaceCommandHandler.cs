using System.Globalization;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.ProjectWorkspace;

public sealed class ProjectWorkspaceCommandHandler(
    IProjectWorkspacePersistence persistence,
    IProjectDocumentStorage documentStorage)
    : ICommandHandler<SetProjectDueDateCommand, ProjectWorkspaceCommandResult>,
      ICommandHandler<UploadProjectDocumentCommand, ProjectWorkspaceCommandResult>
{
    public async Task<ProjectWorkspaceCommandResult> HandleAsync(
        SetProjectDueDateCommand command,
        CancellationToken cancellationToken)
    {
        var order = await persistence.FindActiveOrderByIdAsync(command.OrderId, cancellationToken);
        if (order is null)
            return new ProjectWorkspaceCommandResult { ErrorCode = ProjectWorkspaceErrorCode.NotFound };
        if (!ProjectWorkspaceAccessRules.CanManage(command.RequesterUserId, order))
            return new ProjectWorkspaceCommandResult { ErrorCode = ProjectWorkspaceErrorCode.Forbidden };
        if (order.Status == OrderStatus.Completed)
            return new ProjectWorkspaceCommandResult { ErrorCode = ProjectWorkspaceErrorCode.ProjectCompleted };
        if (order.DueDate == command.DueDate)
            return new ProjectWorkspaceCommandResult
            {
                OrderId = order.Id,
                DueDate = order.DueDate,
                UpdatedAtUtc = order.UpdatedAtUtc
            };

        var now = DateTime.UtcNow;
        order.DueDate = command.DueDate;
        order.UpdatedAtUtc = now;
        persistence.AddActivity(new ProjectActivity
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            ActorUserId = command.RequesterUserId,
            Action = "DueDateChanged",
            Description = command.DueDate is { } dueDate
                ? $"Срок сдачи установлен: {dueDate.ToString("dd.MM.yyyy", CultureInfo.InvariantCulture)}."
                : "Срок сдачи удален.",
            CreatedAtUtc = now
        });
        await persistence.SaveChangesAsync(cancellationToken);

        return new ProjectWorkspaceCommandResult
        {
            OrderId = order.Id,
            DueDate = order.DueDate,
            UpdatedAtUtc = order.UpdatedAtUtc
        };
    }

    public async Task<ProjectWorkspaceCommandResult> HandleAsync(
        UploadProjectDocumentCommand command,
        CancellationToken cancellationToken)
    {
        var order = await persistence.FindActiveOrderByIdAsync(command.OrderId, cancellationToken);
        if (order is null)
            return new ProjectWorkspaceCommandResult { ErrorCode = ProjectWorkspaceErrorCode.NotFound };
        if (!ProjectWorkspaceAccessRules.CanManage(command.RequesterUserId, order))
            return new ProjectWorkspaceCommandResult { ErrorCode = ProjectWorkspaceErrorCode.Forbidden };
        if (order.Status == OrderStatus.Completed)
            return new ProjectWorkspaceCommandResult { ErrorCode = ProjectWorkspaceErrorCode.ProjectCompleted };
        if (!ProjectDocumentFilePolicy.TryNormalize(
                command.FileName,
                command.Length,
                out var safeFileName,
                out var extension,
                out var contentType))
            return new ProjectWorkspaceCommandResult { ErrorCode = ProjectWorkspaceErrorCode.InvalidFile };

        var storageKey = await documentStorage.SaveAsync(
            order.Id,
            command.Content,
            extension,
            contentType,
            cancellationToken);
        var now = DateTime.UtcNow;
        var document = new ProjectDocument
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            UploadedByUserId = command.RequesterUserId,
            FileName = safeFileName,
            ContentType = contentType,
            StorageKey = storageKey,
            Length = command.Length,
            CreatedAtUtc = now
        };
        persistence.AddDocument(document);
        persistence.AddActivity(new ProjectActivity
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            ActorUserId = command.RequesterUserId,
            Action = "DocumentUploaded",
            Description = $"Добавлен документ: {safeFileName}.",
            CreatedAtUtc = now
        });

        try
        {
            await persistence.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            try
            {
                await documentStorage.DeleteAsync(storageKey, cancellationToken);
            }
            catch
            {
                // Preserve the database error; orphaned storage objects can be cleaned up operationally.
            }

            throw;
        }

        return new ProjectWorkspaceCommandResult
        {
            OrderId = order.Id,
            DueDate = order.DueDate,
            UpdatedAtUtc = now,
            Document = document
        };
    }
}
