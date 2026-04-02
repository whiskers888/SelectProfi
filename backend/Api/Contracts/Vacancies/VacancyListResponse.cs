namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class VacancyListResponse
{
    public IReadOnlyList<VacancyResponse> Items { get; init; } = [];

    public int Limit { get; init; }

    public int Offset { get; init; }
}
