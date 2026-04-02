namespace SelectProfi.backend.Application.Vacancies.DeleteVacancy;

public sealed class DeleteVacancyResult
{
    public DeleteVacancyErrorCode ErrorCode { get; init; } = DeleteVacancyErrorCode.None;
}
