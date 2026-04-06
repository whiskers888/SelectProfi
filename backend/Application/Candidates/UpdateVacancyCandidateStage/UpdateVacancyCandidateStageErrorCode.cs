namespace SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;

public enum UpdateVacancyCandidateStageErrorCode
{
    None = 0,
    VacancyNotFound = 1,
    CandidateLinkNotFound = 2,
    Forbidden = 3,
    InvalidStage = 4,
    VacancyNotPublished = 5,
    Conflict = 6
}
