namespace SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;

public sealed class SelectVacancyCandidateResult
{
    public SelectVacancyCandidateErrorCode ErrorCode { get; init; } = SelectVacancyCandidateErrorCode.None;

    public Guid VacancyId { get; init; }

    public Guid SelectedCandidateId { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
