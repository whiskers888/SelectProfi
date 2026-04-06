namespace SelectProfi.backend.Application.Candidates.CreateCandidateResume;

public enum CreateCandidateResumeErrorCode
{
    None = 0,
    VacancyNotFound = 1,
    Forbidden = 2,
    CandidateAlreadyExists = 3,
    InvalidInput = 4,
    VacancyNotPublished = 5,
    Conflict = 6
}
