using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Candidates.CreateCandidateResume;

public interface ICreateCandidateResumePersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<bool> CandidateIdentityExistsAsync(
        string normalizedFullName,
        DateOnly? birthDate,
        string? normalizedEmail,
        string? normalizedPhone,
        CancellationToken cancellationToken);

    Task<CreateCandidateResumePersistenceResult> CreateAsync(
        Candidate candidate,
        CandidateResume resume,
        VacancyCandidate vacancyCandidate,
        CancellationToken cancellationToken);
}

public enum CreateCandidateResumePersistenceResult
{
    Created = 0,
    Conflict = 1
}
