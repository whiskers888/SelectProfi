using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Vacancies.GetVacancyById;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Vacancies.GetVacancyById;

public sealed class GetVacancyByIdPersistence(AppDbContext dbContext) : IGetVacancyByIdPersistence
{
    public Task<Vacancy?> FindActiveByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null, cancellationToken);
    }
}
