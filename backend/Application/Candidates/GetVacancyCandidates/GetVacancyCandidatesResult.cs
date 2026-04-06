using SelectProfi.backend.Domain.Candidates;

namespace SelectProfi.backend.Application.Candidates.GetVacancyCandidates;

public sealed class GetVacancyCandidatesResult
{
    public GetVacancyCandidatesErrorCode ErrorCode { get; init; } = GetVacancyCandidatesErrorCode.None;

    public Guid VacancyId { get; init; }

    public Guid? SelectedCandidateId { get; init; }

    public IReadOnlyList<GetVacancyCandidatesItemResult> Items { get; init; } = [];
}

public sealed class GetVacancyCandidatesItemResult
{
    public Guid VacancyCandidateId { get; init; }

    public Guid CandidateId { get; init; }

    public string PublicAlias { get; init; } = string.Empty;

    public VacancyCandidateStage Stage { get; init; } = VacancyCandidateStage.Pool;

    public DateTime AddedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }

    public bool IsSelected { get; init; }
}
