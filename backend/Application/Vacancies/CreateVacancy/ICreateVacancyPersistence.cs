using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Vacancies.CreateVacancy;

public interface ICreateVacancyPersistence
{
    Task<Order?> FindActiveOrderByIdAsync(Guid orderId, CancellationToken cancellationToken);

    Task<bool> ActiveVacancyExistsForOrderAsync(Guid orderId, CancellationToken cancellationToken);

    Task<CreateVacancyPersistenceResult> CreateAsync(Vacancy vacancy, CancellationToken cancellationToken);
}

public enum CreateVacancyPersistenceResult
{
    Created = 0,
    Conflict = 1
}
