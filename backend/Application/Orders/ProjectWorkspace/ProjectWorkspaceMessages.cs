using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.ProjectWorkspace;

public enum ProjectWorkspaceErrorCode
{
    None = 0,
    NotFound = 1,
    Forbidden = 2,
    ProjectCompleted = 3,
    InvalidFile = 4
}

public sealed record SetProjectDueDateCommand(
    Guid OrderId,
    Guid RequesterUserId,
    DateOnly? DueDate) : ICommand<ProjectWorkspaceCommandResult>;

public sealed record UploadProjectDocumentCommand(
    Guid OrderId,
    Guid RequesterUserId,
    string FileName,
    long Length,
    Stream Content) : ICommand<ProjectWorkspaceCommandResult>;

public sealed class ProjectWorkspaceCommandResult
{
    public ProjectWorkspaceErrorCode ErrorCode { get; init; }

    public Guid OrderId { get; init; }

    public DateOnly? DueDate { get; init; }

    public DateTime UpdatedAtUtc { get; init; }

    public ProjectDocument? Document { get; init; }
}

public sealed record GetProjectHistoryQuery(
    Guid OrderId,
    Guid RequesterUserId,
    UserRole RequesterRole) : IQuery<ProjectHistoryResult>;

public sealed class ProjectHistoryResult
{
    public ProjectWorkspaceErrorCode ErrorCode { get; init; }

    public IReadOnlyList<ProjectActivity> Items { get; init; } = [];
}

public sealed record GetProjectDocumentsQuery(
    Guid OrderId,
    Guid RequesterUserId,
    UserRole RequesterRole) : IQuery<ProjectDocumentsResult>;

public sealed class ProjectDocumentsResult
{
    public ProjectWorkspaceErrorCode ErrorCode { get; init; }

    public IReadOnlyList<ProjectDocument> Items { get; init; } = [];
}

public sealed record GetProjectDocumentQuery(
    Guid OrderId,
    Guid DocumentId,
    Guid RequesterUserId,
    UserRole RequesterRole) : IQuery<ProjectDocumentDownloadResult>;

public sealed class ProjectDocumentDownloadResult
{
    public ProjectWorkspaceErrorCode ErrorCode { get; init; }

    public string FileName { get; init; } = string.Empty;

    public string ContentType { get; init; } = string.Empty;

    public byte[] Content { get; init; } = [];
}
