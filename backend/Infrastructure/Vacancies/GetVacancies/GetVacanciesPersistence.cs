using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Vacancies.GetVacancies;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Vacancies.GetVacancies;

public sealed class GetVacanciesPersistence(AppDbContext dbContext) : IGetVacanciesPersistence
{
    public async Task<IReadOnlyList<Vacancy>> FindVisibleActiveVacanciesAsync(
        Guid requesterUserId,
        UserRole requesterRole,
        int limit,
        int offset,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Vacancies
            .AsNoTracking()
            .Where(vacancy => vacancy.DeletedAtUtc == null);

        query = requesterRole switch
        {
            UserRole.Admin => query,
            UserRole.Customer => query.Where(vacancy => vacancy.CustomerId == requesterUserId),
            UserRole.Executor => query.Where(vacancy => vacancy.ExecutorId == requesterUserId),
            _ => query.Where(_ => false)
        };

        return await query
            .OrderByDescending(vacancy => vacancy.CreatedAtUtc)
            .Skip(offset)
            .Take(limit)
            .ToArrayAsync(cancellationToken);
    }
}
