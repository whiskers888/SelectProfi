namespace SelectProfi.backend.Application.Candidates.SubmitVacancyCandidateList;

public enum SubmitVacancyCandidateListErrorCode
{
    None = 0,
    VacancyNotFound,
    Forbidden,
    VacancyNotPublished,
    ShortlistIncomplete,
    AlreadySubmitted,
    Conflict
}

public sealed class SubmitVacancyCandidateListResult
{
    public SubmitVacancyCandidateListErrorCode ErrorCode { get; init; }

    public Guid VacancyId { get; init; }

    public DateTime SubmittedAtUtc { get; init; }

    public int SubmittedCandidatesCount { get; init; }
}
