namespace SelectProfi.backend.Application.Dashboard.GetCustomerDashboardStats;

public interface IGetCustomerDashboardStatsPersistence
{
    Task<CustomerDashboardStatsSnapshot> GetCustomerStatsAsync(
        Guid customerUserId,
        CancellationToken cancellationToken);
}

public sealed class CustomerDashboardStatsSnapshot
{
    public int ActiveProjectsCount { get; init; }

    public int PipelineCandidatesCount { get; init; }

    public int ShortlistCandidatesCount { get; init; }

    public int OnApprovalVacanciesCount { get; init; }
}
