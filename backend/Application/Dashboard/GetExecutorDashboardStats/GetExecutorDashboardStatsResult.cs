namespace SelectProfi.backend.Application.Dashboard.GetExecutorDashboardStats;

public sealed class GetExecutorDashboardStatsResult
{
    public GetExecutorDashboardStatsErrorCode ErrorCode { get; init; } = GetExecutorDashboardStatsErrorCode.None;

    public int ActiveProjectsCount { get; init; }

    public int PipelineCandidatesCount { get; init; }

    public int ShortlistCandidatesCount { get; init; }

    public int OnApprovalVacanciesCount { get; init; }
}
