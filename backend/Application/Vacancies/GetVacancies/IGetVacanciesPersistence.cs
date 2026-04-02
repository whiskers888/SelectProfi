using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Vacancies.GetVacancies;

public interface IGetVacanciesPersistence
{
    Task<IReadOnlyList<Vacancy>> FindVisibleActiveVacanciesAsync(
        Guid requesterUserId,
        UserRole requesterRole,
        int limit,
        int offset,
        CancellationToken cancellationToken);
}
