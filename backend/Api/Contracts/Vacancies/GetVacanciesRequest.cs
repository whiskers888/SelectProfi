using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class GetVacanciesRequest
{
    [Range(1, 100)]
    public int Limit { get; init; } = 20;

    [Range(0, int.MaxValue)]
    public int Offset { get; init; }
}
