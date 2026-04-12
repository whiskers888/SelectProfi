namespace SelectProfi.backend.Application.Candidates.RespondToVacancy;

public enum RespondToVacancyErrorCode
{
    None = 0,
    VacancyNotFound = 1,
    Forbidden = 2,
    VacancyNotPublished = 3,
    ApplicantNotFound = 4,
    AlreadyResponded = 5,
    Conflict = 6
}

