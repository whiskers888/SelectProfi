namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class VacancyCandidatesResponse
{
    public Guid VacancyId { get; init; }

    public Guid? SelectedCandidateId { get; init; }

    public VacancyCandidatesItemResponse[] Items { get; init; } = [];
}

public sealed class VacancyCandidatesItemResponse
{
    public Guid VacancyCandidateId { get; init; }

    public Guid CandidateId { get; init; }

    public string PublicAlias { get; init; } = string.Empty;

    public string Stage { get; init; } = string.Empty;

    public DateTime AddedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }

    public DateTime? ViewedByCustomerAtUtc { get; init; }

    public bool IsSelected { get; init; }
}
