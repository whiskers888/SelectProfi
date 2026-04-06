namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class SelectedCandidateContactsResponse
{
    public Guid VacancyId { get; init; }

    public Guid CandidateId { get; init; }

    public string FullName { get; init; } = string.Empty;

    public string? Email { get; init; }

    public string? Phone { get; init; }
}
