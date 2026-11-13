namespace SelectProfi.backend.Contracts.Dashboard;

public sealed class ExecutorDashboardStatsResponse
{
    public int ActiveProjectsCount { get; init; }

    public int PipelineCandidatesCount { get; init; }

    public int ShortlistCandidatesCount { get; init; }

    public int OnApprovalVacanciesCount { get; init; }

    public decimal AvailableBalance { get; init; }

    public decimal ReservedBalance { get; init; }

    public string CurrencyCode { get; init; } = "RUB";

    public int UnreadNotificationsCount { get; init; }
}
