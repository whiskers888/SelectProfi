namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class VacancyResponse
{
    public Guid Id { get; init; }

    public Guid OrderId { get; init; }

    public Guid CustomerId { get; init; }

    public Guid ExecutorId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
