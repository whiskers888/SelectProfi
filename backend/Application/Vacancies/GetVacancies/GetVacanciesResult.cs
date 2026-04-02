namespace SelectProfi.backend.Application.Vacancies.GetVacancies;

public sealed class GetVacanciesResult
{
    public GetVacanciesErrorCode ErrorCode { get; init; } = GetVacanciesErrorCode.None;

    public IReadOnlyList<GetVacanciesItemResult> Items { get; init; } = [];

    public int Limit { get; init; }

    public int Offset { get; init; }
}

public sealed class GetVacanciesItemResult
{
    public Guid VacancyId { get; init; }

    public Guid OrderId { get; init; }

    public Guid CustomerId { get; init; }

    public Guid ExecutorId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
