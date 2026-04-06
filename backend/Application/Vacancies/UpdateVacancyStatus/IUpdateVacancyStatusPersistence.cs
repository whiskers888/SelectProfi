using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Vacancies.UpdateVacancyStatus;

public interface IUpdateVacancyStatusPersistence
{
    Task<Vacancy?> FindActiveByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<UpdateVacancyStatusPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum UpdateVacancyStatusPersistenceResult
{
    Saved = 0,
    Conflict = 1
}
