namespace SelectProfi.backend.Application.Candidates.GetVacancyBaseCandidates;

public sealed class GetVacancyBaseCandidatesResult
{
    public GetVacancyBaseCandidatesErrorCode ErrorCode { get; init; } = GetVacancyBaseCandidatesErrorCode.None;

    public Guid VacancyId { get; init; }

    public IReadOnlyList<GetVacancyBaseCandidatesItemResult> Items { get; init; } = [];
}

public sealed class GetVacancyBaseCandidatesItemResult
{
    public Guid CandidateId { get; init; }

    public string PublicAlias { get; init; } = string.Empty;

    public DateTime UpdatedAtUtc { get; init; }
}
