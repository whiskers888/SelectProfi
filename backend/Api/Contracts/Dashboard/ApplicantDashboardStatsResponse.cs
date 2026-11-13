namespace SelectProfi.backend.Contracts.Dashboard;

public sealed class ApplicantDashboardStatsResponse
{
    public int ApplicationsCount { get; init; }

    public int ShortlistCandidatesCount { get; init; }

    public int UnreadNotificationsCount { get; init; }

    public string? ResumeTitle { get; init; }
}
