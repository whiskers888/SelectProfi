namespace SelectProfi.backend.Application.Dashboard.GetExecutorDashboardStats;

public interface IGetExecutorDashboardStatsPersistence
{
    Task<ExecutorDashboardStatsSnapshot> GetExecutorStatsAsync(
        Guid executorUserId,
        CancellationToken cancellationToken);
}

public sealed class ExecutorDashboardStatsSnapshot
{
    public int ActiveProjectsCount { get; init; }

    public int PipelineCandidatesCount { get; init; }

    public int ShortlistCandidatesCount { get; init; }

    public int OnApprovalVacanciesCount { get; init; }
}
