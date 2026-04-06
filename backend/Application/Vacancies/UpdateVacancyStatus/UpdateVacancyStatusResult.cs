using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Vacancies.UpdateVacancyStatus;

public sealed class UpdateVacancyStatusResult
{
    public UpdateVacancyStatusErrorCode ErrorCode { get; init; } = UpdateVacancyStatusErrorCode.None;

    public Guid VacancyId { get; init; }

    public Guid OrderId { get; init; }

    public Guid CustomerId { get; init; }

    public Guid ExecutorId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public VacancyStatus Status { get; init; } = VacancyStatus.Draft;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
