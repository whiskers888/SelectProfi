using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Candidates.GetVacancyCandidates;

public interface IGetVacancyCandidatesPersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<IReadOnlyList<VacancyCandidate>> FindActiveVacancyCandidatesAsync(
        Guid vacancyId,
        CancellationToken cancellationToken);
}
