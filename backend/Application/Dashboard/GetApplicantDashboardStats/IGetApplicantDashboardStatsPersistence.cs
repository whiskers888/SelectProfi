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

    public int ShortlistCandidatesCount { get; init; }

    public int UnreadNotificationsCount { get; init; }

    public string? ResumeTitle { get; init; }
}
