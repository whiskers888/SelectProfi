using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Candidates.GetVacancyBaseCandidates;

public interface IGetVacancyBaseCandidatesPersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Candidate>> FindAvailableBaseCandidatesAsync(
        Guid vacancyId,
        CancellationToken cancellationToken);
}
