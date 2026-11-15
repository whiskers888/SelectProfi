using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Candidates.GetSelectedCandidateContacts;

public interface IGetSelectedCandidateContactsPersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<Candidate?> FindActiveSubmittedCandidateAsync(
        Guid vacancyId,
        Guid candidateId,
        CancellationToken cancellationToken);
}
