using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.SelectVacancyCandidate;

public sealed class SelectVacancyCandidatePersistence(AppDbContext dbContext) : ISelectVacancyCandidatePersistence
{
    public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies.Include(vacancy => vacancy.Order).FirstOrDefaultAsync(
            vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null,
            cancellationToken);
    }

    public Task<bool> CandidateInSubmittedShortlistAsync(Guid vacancyId, Guid candidateId, CancellationToken cancellationToken)
    {
        return dbContext.VacancyCandidates.AnyAsync(
            vacancyCandidate => vacancyCandidate.VacancyId == vacancyId
                                && vacancyCandidate.CandidateId == candidateId
                                && vacancyCandidate.Stage == VacancyCandidateStage.Shortlist
                                && vacancyCandidate.CustomerSubmittedAtUtc != null
                                && vacancyCandidate.DeletedAtUtc == null,
            cancellationToken);
    }

    public async Task<SelectVacancyCandidatePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        foreach (var entry in dbContext.ChangeTracker.Entries<Vacancy>()
                     .Where(entry => entry.State == EntityState.Modified &&
                                     entry.Property(vacancy => vacancy.SelectedCandidateId).IsModified))
        {
            var vacancy = entry.Entity;
            var now = DateTime.UtcNow;
            dbContext.ProjectActivities.Add(new ProjectActivity
            {
                Id = Guid.NewGuid(),
                OrderId = vacancy.OrderId,
                ActorUserId = vacancy.CustomerId,
                Action = "CandidateSelected",
                Description = "Заказчик выбрал кандидата.",
                CreatedAtUtc = now
            });
        }

        foreach (var entry in dbContext.ChangeTracker.Entries<Order>()
                     .Where(entry => entry.State == EntityState.Modified &&
                                     entry.Property(order => order.Status).IsModified &&
                                     entry.Entity.Status == OrderStatus.Completed))
        {
            dbContext.ProjectActivities.Add(new ProjectActivity
            {
                Id = Guid.NewGuid(),
                OrderId = entry.Entity.Id,
                ActorUserId = entry.Entity.CustomerId,
                Action = "ProjectCompleted",
                Description = "Проект завершен после выбора кандидата заказчиком.",
                CreatedAtUtc = entry.Entity.CompletedAtUtc ?? DateTime.UtcNow
            });
        }

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return SelectVacancyCandidatePersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return SelectVacancyCandidatePersistenceResult.Conflict;
        }
        catch (DbUpdateConcurrencyException)
        {
            return SelectVacancyCandidatePersistenceResult.Conflict;
        }
    }

    private static bool IsUniqueViolation(DbUpdateException exception)
    {
        var innerException = exception.InnerException;
        if (innerException is null)
            return false;

        var sqlStateProperty = innerException.GetType().GetProperty("SqlState");
        var sqlStateValue = sqlStateProperty?.GetValue(innerException) as string;

        return string.Equals(sqlStateValue, "23505", StringComparison.Ordinal);
    }
}
