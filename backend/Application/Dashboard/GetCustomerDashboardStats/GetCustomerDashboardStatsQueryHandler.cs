using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Dashboard.GetCustomerDashboardStats;

public sealed class GetCustomerDashboardStatsQueryHandler(IGetCustomerDashboardStatsPersistence persistence)
    : IQueryHandler<GetCustomerDashboardStatsQuery, GetCustomerDashboardStatsResult>
{
    public async Task<GetCustomerDashboardStatsResult> HandleAsync(
        GetCustomerDashboardStatsQuery query,
        CancellationToken cancellationToken)
    {
        if (query.RequesterRole != UserRole.Customer)
        {
            return new GetCustomerDashboardStatsResult { ErrorCode = GetCustomerDashboardStatsErrorCode.Forbidden };
        }

        var stats = await persistence.GetCustomerStatsAsync(query.RequesterUserId, cancellationToken);

        return new GetCustomerDashboardStatsResult
        {
            ErrorCode = GetCustomerDashboardStatsErrorCode.None,
            ActiveProjectsCount = stats.ActiveProjectsCount,
            PipelineCandidatesCount = stats.PipelineCandidatesCount,
            ShortlistCandidatesCount = stats.ShortlistCandidatesCount,
            OnApprovalVacanciesCount = stats.OnApprovalVacanciesCount
        };
    }
}
