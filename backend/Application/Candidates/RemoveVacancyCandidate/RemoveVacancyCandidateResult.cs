namespace SelectProfi.backend.Application.Candidates.RemoveVacancyCandidate;

public enum RemoveVacancyCandidateErrorCode { None = 0, VacancyNotFound, Forbidden, VacancyNotPublished, CandidateLinkNotFound }

public sealed class RemoveVacancyCandidateResult
{
    public RemoveVacancyCandidateErrorCode ErrorCode { get; init; }
}
