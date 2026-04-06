namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class VacancyCandidateResponse
{
    public Guid VacancyCandidateId { get; init; }

    public Guid VacancyId { get; init; }

    public Guid CandidateId { get; init; }

    public string Stage { get; init; } = string.Empty;

    public DateTime AddedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
