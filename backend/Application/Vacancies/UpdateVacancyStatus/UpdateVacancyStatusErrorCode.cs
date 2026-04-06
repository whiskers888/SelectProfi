namespace SelectProfi.backend.Application.Vacancies.UpdateVacancyStatus;

public enum UpdateVacancyStatusErrorCode
{
    None = 0,
    NotFound = 1,
    Forbidden = 2,
    InvalidTransition = 3,
    Conflict = 4
}
