using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Candidates.RemoveVacancyCandidate;

public interface IRemoveVacancyCandidatePersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);
    Task<VacancyCandidate?> FindActiveLinkAsync(Guid vacancyId, Guid candidateId, CancellationToken cancellationToken);
    Task<RemoveVacancyCandidatePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum RemoveVacancyCandidatePersistenceResult
{
    Saved = 0,
    Conflict = 1
}
