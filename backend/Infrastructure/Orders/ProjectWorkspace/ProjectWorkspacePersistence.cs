using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.ProjectWorkspace;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.ProjectWorkspace;

public sealed class ProjectWorkspacePersistence(AppDbContext dbContext) : IProjectWorkspacePersistence
{
    public Task<Order?> FindActiveOrderByIdAsync(Guid orderId, CancellationToken cancellationToken) =>
        dbContext.Orders.FirstOrDefaultAsync(
            order => order.Id == orderId && order.DeletedAtUtc == null,
            cancellationToken);

    public async Task<IReadOnlyList<ProjectActivity>> FindHistoryAsync(
        Guid orderId,
        CancellationToken cancellationToken) =>
        await dbContext.ProjectActivities
            .AsNoTracking()
            .Where(activity => activity.OrderId == orderId)
            .OrderByDescending(activity => activity.CreatedAtUtc)
            .ThenByDescending(activity => activity.Id)
            .Take(200)
            .ToArrayAsync(cancellationToken);

    public async Task<IReadOnlyList<ProjectDocument>> FindDocumentsAsync(
        Guid orderId,
        CancellationToken cancellationToken) =>
        await dbContext.ProjectDocuments
            .AsNoTracking()
            .Where(document => document.OrderId == orderId)
            .OrderByDescending(document => document.CreatedAtUtc)
            .ToArrayAsync(cancellationToken);

    public Task<ProjectDocument?> FindDocumentAsync(
        Guid orderId,
        Guid documentId,
        CancellationToken cancellationToken) =>
        dbContext.ProjectDocuments.AsNoTracking()
            .FirstOrDefaultAsync(document => document.OrderId == orderId && document.Id == documentId, cancellationToken);

    public void AddActivity(ProjectActivity activity) => dbContext.ProjectActivities.Add(activity);

    public void AddDocument(ProjectDocument document) => dbContext.ProjectDocuments.Add(document);

    public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
        _ = await dbContext.SaveChangesAsync(cancellationToken);
}
