using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;

public interface IUpdateVacancyCandidateStagePersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<VacancyCandidate?> FindActiveVacancyCandidateAsync(
        Guid vacancyId,
        Guid candidateId,
        CancellationToken cancellationToken);

    Task<UpdateVacancyCandidateStagePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum UpdateVacancyCandidateStagePersistenceResult
{
    Saved = 0,
    Conflict = 1
}
