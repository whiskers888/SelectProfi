using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.ProjectWorkspace;

public interface IProjectWorkspacePersistence
{
    Task<Order?> FindActiveOrderByIdAsync(Guid orderId, CancellationToken cancellationToken);

    Task<IReadOnlyList<ProjectActivity>> FindHistoryAsync(Guid orderId, CancellationToken cancellationToken);

    Task<IReadOnlyList<ProjectDocument>> FindDocumentsAsync(Guid orderId, CancellationToken cancellationToken);

    Task<ProjectDocument?> FindDocumentAsync(Guid orderId, Guid documentId, CancellationToken cancellationToken);

    void AddActivity(ProjectActivity activity);

    void AddDocument(ProjectDocument document);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}
