using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Dashboard.GetExecutorDashboardStats;

public sealed class GetExecutorDashboardStatsQueryHandler(IGetExecutorDashboardStatsPersistence persistence)
    : IQueryHandler<GetExecutorDashboardStatsQuery, GetExecutorDashboardStatsResult>
{
    public async Task<GetExecutorDashboardStatsResult> HandleAsync(
        GetExecutorDashboardStatsQuery query,
        CancellationToken cancellationToken)
    {
        if (query.RequesterRole != UserRole.Executor)
        {
            return new GetExecutorDashboardStatsResult { ErrorCode = GetExecutorDashboardStatsErrorCode.Forbidden };
        }

        var stats = await persistence.GetExecutorStatsAsync(query.RequesterUserId, cancellationToken);

        return new GetExecutorDashboardStatsResult
        {
            ErrorCode = GetExecutorDashboardStatsErrorCode.None,
            ActiveProjectsCount = stats.ActiveProjectsCount,
            PipelineCandidatesCount = stats.PipelineCandidatesCount,
            ShortlistCandidatesCount = stats.ShortlistCandidatesCount,
            OnApprovalVacanciesCount = stats.OnApprovalVacanciesCount
        };
    }
}
