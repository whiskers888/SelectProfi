using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.RemoveVacancyCandidate;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.RemoveVacancyCandidate;

public sealed class RemoveVacancyCandidatePersistence(AppDbContext dbContext) : IRemoveVacancyCandidatePersistence
{
    public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken) =>
        dbContext.Vacancies.FirstOrDefaultAsync(item => item.Id == vacancyId && item.DeletedAtUtc == null, cancellationToken);
    public Task<VacancyCandidate?> FindActiveLinkAsync(Guid vacancyId, Guid candidateId, CancellationToken cancellationToken) =>
        dbContext.VacancyCandidates.FirstOrDefaultAsync(item => item.VacancyId == vacancyId && item.CandidateId == candidateId && item.DeletedAtUtc == null, cancellationToken);
    public async Task<RemoveVacancyCandidatePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        foreach (var entry in dbContext.ChangeTracker.Entries<VacancyCandidate>()
                     .Where(entry => entry.State == EntityState.Modified && entry.Property(item => item.DeletedAtUtc).IsModified && entry.Entity.DeletedAtUtc.HasValue))
        {
            var removedAtUtc = entry.Entity.DeletedAtUtc;
            if (!removedAtUtc.HasValue)
                continue;
            var orderId = await dbContext.Vacancies
                .Where(vacancy => vacancy.Id == entry.Entity.VacancyId)
                .Select(vacancy => vacancy.OrderId)
                .FirstAsync(cancellationToken);
            dbContext.ProjectActivities.Add(new ProjectActivity
            {
                Id = Guid.NewGuid(),
                OrderId = orderId,
                ActorUserId = entry.Entity.AddedByExecutorId,
                Action = "CandidateRemoved",
                Description = "Кандидат удален из проекта.",
                CreatedAtUtc = removedAtUtc.Value
            });
        }

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return RemoveVacancyCandidatePersistenceResult.Saved;
        }
        catch (DbUpdateConcurrencyException)
        {
            return RemoveVacancyCandidatePersistenceResult.Conflict;
        }
    }
}
