namespace SelectProfi.backend.Application.Orders.ProjectWorkspace;

public interface IProjectDocumentStorage
{
    Task<string> SaveAsync(
        Guid orderId,
        Stream content,
        string extension,
        string contentType,
        CancellationToken cancellationToken);

    Task<byte[]> ReadAsync(string storageKey, CancellationToken cancellationToken);

    Task DeleteAsync(string storageKey, CancellationToken cancellationToken);
}
