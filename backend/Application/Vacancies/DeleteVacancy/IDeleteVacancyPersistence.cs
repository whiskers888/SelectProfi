using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Vacancies.DeleteVacancy;

public interface IDeleteVacancyPersistence
{
    Task<Vacancy?> FindActiveByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<DeleteVacancyPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum DeleteVacancyPersistenceResult
{
    Saved = 0,
    Conflict = 1
}
