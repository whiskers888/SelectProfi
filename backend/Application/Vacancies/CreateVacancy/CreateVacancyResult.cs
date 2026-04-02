namespace SelectProfi.backend.Application.Vacancies.CreateVacancy;

public sealed class CreateVacancyResult
{
    public CreateVacancyErrorCode ErrorCode { get; init; } = CreateVacancyErrorCode.None;

    public Guid VacancyId { get; init; }

    public Guid OrderId { get; init; }

    public Guid CustomerId { get; init; }

    public Guid ExecutorId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
