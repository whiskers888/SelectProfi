using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Candidates.RespondToVacancy;

public interface IRespondToVacancyPersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<User?> FindApplicantByIdAsync(Guid applicantUserId, CancellationToken cancellationToken);

    Task<Candidate?> FindActiveRegisteredCandidateByUserIdAsync(Guid userId, CancellationToken cancellationToken);

    Task<bool> VacancyCandidateLinkExistsAsync(Guid vacancyId, Guid candidateId, CancellationToken cancellationToken);

    Task<RespondToVacancyPersistenceResult> CreateAsync(
        Candidate? candidateToCreate,
        VacancyCandidate vacancyCandidate,
        CancellationToken cancellationToken);
}

public enum RespondToVacancyPersistenceResult
{
    Created = 0,
    Conflict = 1
}

