using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Candidates.MarkVacancyCandidateViewedByCustomer;

public interface IMarkVacancyCandidateViewedByCustomerPersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<VacancyCandidate?> FindActiveVacancyCandidateAsync(
        Guid vacancyId,
        Guid candidateId,
        CancellationToken cancellationToken);

    Task<MarkVacancyCandidateViewedByCustomerPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum MarkVacancyCandidateViewedByCustomerPersistenceResult
{
    Saved = 0,
    Conflict = 1
}
