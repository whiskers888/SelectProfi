using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Candidates.CreateCandidateResume;

public interface ICreateCandidateResumePersistence
{
    Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken);

    Task<OrderSpecialization?> FindActiveSpecializationByIdAsync(Guid specializationId, CancellationToken cancellationToken);

    Task<bool> CandidateIdentityExistsAsync(
        string normalizedFullName,
        DateOnly? birthDate,
        string? normalizedEmail,
        string? normalizedPhone,
        CancellationToken cancellationToken);

    Task<CreateCandidateResumePersistenceResult> CreateAsync(
        Candidate candidate,
        CandidateResume resume,
        VacancyCandidate? vacancyCandidate,
        CancellationToken cancellationToken);
}

public enum CreateCandidateResumePersistenceResult
{
    Created = 0,
    Conflict = 1
}
