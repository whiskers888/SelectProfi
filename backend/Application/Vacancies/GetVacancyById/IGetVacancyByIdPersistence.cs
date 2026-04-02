using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Vacancies.GetVacancyById;

public interface IGetVacancyByIdPersistence
{
    Task<Vacancy?> FindActiveByIdAsync(Guid vacancyId, CancellationToken cancellationToken);
}
