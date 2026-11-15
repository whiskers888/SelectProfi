using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Candidates.SubmitVacancyCandidateList;

public interface ISubmitVacancyCandidateListPersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<IReadOnlyList<VacancyCandidate>> FindActiveShortlistCandidatesAsync(
        Guid vacancyId,
        CancellationToken cancellationToken);

    Task<SubmitVacancyCandidateListPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum SubmitVacancyCandidateListPersistenceResult
{
    Saved = 0,
    Conflict = 1
}
