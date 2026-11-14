using SelectProfi.backend.Domain.Candidates;

namespace SelectProfi.backend.Application.Dashboard.GetApplicantDashboardStats;

public interface IGetApplicantDashboardStatsPersistence
{
    Task<ApplicantDashboardStatsSnapshot> GetApplicantStatsAsync(
        Guid applicantUserId,
        CancellationToken cancellationToken);
}

public sealed class ApplicantDashboardStatsSnapshot
{
    public int ApplicationsCount { get; init; }

    public int UnclassifiedCandidateLinksCount { get; init; }

    public int ShortlistCandidatesCount { get; init; }

    public int UnreadNotificationsCount { get; init; }

    public string? ResumeTitle { get; init; }

    public IReadOnlyList<ApplicantDashboardApplicationSnapshot> Applications { get; init; } = [];
}

public sealed class ApplicantDashboardApplicationSnapshot
{
    public Guid VacancyId { get; init; }

    public string VacancyTitle { get; init; } = string.Empty;

    public string? CompanyName { get; init; }

    public VacancyCandidateStage Stage { get; init; }

    public DateTime SubmittedAtUtc { get; init; }

    public DateTime? FirstViewedAtUtc { get; init; }
}
