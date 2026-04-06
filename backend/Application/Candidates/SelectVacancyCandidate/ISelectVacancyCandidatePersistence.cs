using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;

public interface ISelectVacancyCandidatePersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<bool> CandidateInShortlistAsync(Guid vacancyId, Guid candidateId, CancellationToken cancellationToken);

    Task<SelectVacancyCandidatePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum SelectVacancyCandidatePersistenceResult
{
    Saved = 0,
    Conflict = 1
}
