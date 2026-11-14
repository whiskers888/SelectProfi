namespace SelectProfi.backend.Application.Dashboard.GetApplicantDashboardStats;

public sealed class GetApplicantDashboardStatsResult
{
    public GetApplicantDashboardStatsErrorCode ErrorCode { get; init; } = GetApplicantDashboardStatsErrorCode.None;

    public int ApplicationsCount { get; init; }

    public int UnclassifiedCandidateLinksCount { get; init; }

    public int ShortlistCandidatesCount { get; init; }

    public int UnreadNotificationsCount { get; init; }

    public string? ResumeTitle { get; init; }

    public IReadOnlyList<ApplicantDashboardApplicationSnapshot> Applications { get; init; } = [];
}
