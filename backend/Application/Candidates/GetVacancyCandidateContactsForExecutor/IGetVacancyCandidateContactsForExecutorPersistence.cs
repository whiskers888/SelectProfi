using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;

public interface IGetVacancyCandidateContactsForExecutorPersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<VacancyCandidate?> FindActiveVacancyCandidateAsync(
        Guid vacancyId,
        Guid candidateId,
        CancellationToken cancellationToken);
}
