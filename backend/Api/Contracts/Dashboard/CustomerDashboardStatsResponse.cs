namespace SelectProfi.backend.Contracts.Dashboard;

public sealed class CustomerDashboardStatsResponse
{
    public int ActiveProjectsCount { get; init; }

    public int PipelineCandidatesCount { get; init; }

    public int ShortlistCandidatesCount { get; init; }

    public int OnApprovalVacanciesCount { get; init; }
}
