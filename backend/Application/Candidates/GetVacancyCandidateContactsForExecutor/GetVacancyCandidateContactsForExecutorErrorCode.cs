namespace SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;

public enum GetVacancyCandidateContactsForExecutorErrorCode
{
    None = 0,
    VacancyNotFound = 1,
    CandidateLinkNotFound = 2,
    Forbidden = 3,
    ContactsAccessDenied = 4
}
