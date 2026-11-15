namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class SubmitVacancyCandidateListResponse
{
    public Guid VacancyId { get; init; }

    public DateTime SubmittedAtUtc { get; init; }

    public int SubmittedCandidatesCount { get; init; }
}
