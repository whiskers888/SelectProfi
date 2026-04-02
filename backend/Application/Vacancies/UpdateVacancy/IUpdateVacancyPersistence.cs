using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Vacancies.UpdateVacancy;

public interface IUpdateVacancyPersistence
{
    Task<Vacancy?> FindActiveByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<UpdateVacancyPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum UpdateVacancyPersistenceResult
{
    Saved = 0,
    Conflict = 1
}
