namespace SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;

public enum SelectVacancyCandidateErrorCode
{
    None = 0,
    VacancyNotFound = 1,
    Forbidden = 2,
    CandidateNotInShortlist = 3,
    VacancyNotPublished = 4,
    Conflict = 5
}
