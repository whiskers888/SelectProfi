using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.ProjectWorkspace;

public sealed class ProjectWorkspaceQueryHandler(
    IProjectWorkspacePersistence persistence,
    IProjectDocumentStorage documentStorage)
    : IQueryHandler<GetProjectHistoryQuery, ProjectHistoryResult>,
      IQueryHandler<GetProjectDocumentsQuery, ProjectDocumentsResult>,
      IQueryHandler<GetProjectDocumentQuery, ProjectDocumentDownloadResult>
{
    public async Task<ProjectHistoryResult> HandleAsync(
        GetProjectHistoryQuery query,
        CancellationToken cancellationToken)
    {
        var order = await persistence.FindActiveOrderByIdAsync(query.OrderId, cancellationToken);
        if (order is null)
            return new ProjectHistoryResult { ErrorCode = ProjectWorkspaceErrorCode.NotFound };
        if (!ProjectWorkspaceAccessRules.CanRead(query.RequesterRole, query.RequesterUserId, order))
            return new ProjectHistoryResult { ErrorCode = ProjectWorkspaceErrorCode.Forbidden };

        return new ProjectHistoryResult
        {
            Items = await persistence.FindHistoryAsync(query.OrderId, cancellationToken)
        };
    }

    public async Task<ProjectDocumentsResult> HandleAsync(
        GetProjectDocumentsQuery query,
        CancellationToken cancellationToken)
    {
        var order = await persistence.FindActiveOrderByIdAsync(query.OrderId, cancellationToken);
        if (order is null)
            return new ProjectDocumentsResult { ErrorCode = ProjectWorkspaceErrorCode.NotFound };
        if (!ProjectWorkspaceAccessRules.CanRead(query.RequesterRole, query.RequesterUserId, order))
            return new ProjectDocumentsResult { ErrorCode = ProjectWorkspaceErrorCode.Forbidden };

        return new ProjectDocumentsResult
        {
            Items = await persistence.FindDocumentsAsync(query.OrderId, cancellationToken)
        };
    }

    public async Task<ProjectDocumentDownloadResult> HandleAsync(
        GetProjectDocumentQuery query,
        CancellationToken cancellationToken)
    {
        var order = await persistence.FindActiveOrderByIdAsync(query.OrderId, cancellationToken);
        if (order is null)
            return new ProjectDocumentDownloadResult { ErrorCode = ProjectWorkspaceErrorCode.NotFound };
        if (!ProjectWorkspaceAccessRules.CanRead(query.RequesterRole, query.RequesterUserId, order))
            return new ProjectDocumentDownloadResult { ErrorCode = ProjectWorkspaceErrorCode.Forbidden };

        var document = await persistence.FindDocumentAsync(query.OrderId, query.DocumentId, cancellationToken);
        if (document is null)
            return new ProjectDocumentDownloadResult { ErrorCode = ProjectWorkspaceErrorCode.NotFound };

        return new ProjectDocumentDownloadResult
        {
            FileName = document.FileName,
            ContentType = document.ContentType,
            Content = await documentStorage.ReadAsync(document.StorageKey, cancellationToken)
        };
    }
}
