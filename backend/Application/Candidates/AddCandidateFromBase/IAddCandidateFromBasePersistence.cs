using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Candidates.AddCandidateFromBase;

public interface IAddCandidateFromBasePersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<Candidate?> FindRegisteredCandidateByIdAsync(Guid candidateId, CancellationToken cancellationToken);

    Task<AddCandidateFromBasePersistenceResult> CreateAsync(
        VacancyCandidate vacancyCandidate,
        CancellationToken cancellationToken);
}

public enum AddCandidateFromBasePersistenceResult
{
    Created = 0,
    Conflict = 1
}
