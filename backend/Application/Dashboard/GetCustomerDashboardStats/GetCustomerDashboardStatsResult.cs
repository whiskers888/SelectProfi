namespace SelectProfi.backend.Application.Dashboard.GetCustomerDashboardStats;

public sealed class GetCustomerDashboardStatsResult
{
    public GetCustomerDashboardStatsErrorCode ErrorCode { get; init; } = GetCustomerDashboardStatsErrorCode.None;

    public int ActiveProjectsCount { get; init; }

    public int PipelineCandidatesCount { get; init; }

    public int ShortlistCandidatesCount { get; init; }

    public int OnApprovalVacanciesCount { get; init; }
}
