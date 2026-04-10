namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class VacancyBaseCandidatesResponse
{
    public Guid VacancyId { get; init; }

    public IReadOnlyList<VacancyBaseCandidatesItemResponse> Items { get; init; } = [];
}

public sealed class VacancyBaseCandidatesItemResponse
{
    public Guid CandidateId { get; init; }

    public string PublicAlias { get; init; } = string.Empty;

    public DateTime UpdatedAtUtc { get; init; }
}
