namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class CandidateResumeResponse
{
    public Guid CandidateId { get; init; }

    public Guid CandidateResumeId { get; init; }

    public Guid VacancyCandidateId { get; init; }

    public string PublicAlias { get; init; } = string.Empty;

    public DateTime ContactsAccessExpiresAtUtc { get; init; }
}
