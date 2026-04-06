namespace SelectProfi.backend.Contracts.Vacancies;

public sealed class SelectedVacancyCandidateResponse
{
    public Guid VacancyId { get; init; }

    public Guid SelectedCandidateId { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
