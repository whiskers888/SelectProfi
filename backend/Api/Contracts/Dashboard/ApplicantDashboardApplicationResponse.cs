using SelectProfi.backend.Contracts.Vacancies;

namespace SelectProfi.backend.Contracts.Dashboard;

public sealed class ApplicantDashboardApplicationResponse
{
    public Guid VacancyId { get; init; }

    public string VacancyTitle { get; init; } = string.Empty;

    public string? CompanyName { get; init; }

    public VacancyCandidateStageContract Stage { get; init; }

    public DateTime SubmittedAtUtc { get; init; }

    public DateTime? FirstViewedAtUtc { get; init; }
}
