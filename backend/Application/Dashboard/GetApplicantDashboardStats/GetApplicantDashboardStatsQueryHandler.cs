using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Dashboard.GetApplicantDashboardStats;

public sealed class GetApplicantDashboardStatsQueryHandler(IGetApplicantDashboardStatsPersistence persistence)
    : IQueryHandler<GetApplicantDashboardStatsQuery, GetApplicantDashboardStatsResult>
{
    public async Task<GetApplicantDashboardStatsResult> HandleAsync(
        GetApplicantDashboardStatsQuery query,
        CancellationToken cancellationToken)
    {
        if (query.RequesterRole != UserRole.Applicant)
        {
            return new GetApplicantDashboardStatsResult
            {
                ErrorCode = GetApplicantDashboardStatsErrorCode.Forbidden
            };
        }

        var stats = await persistence.GetApplicantStatsAsync(query.RequesterUserId, cancellationToken);

        return new GetApplicantDashboardStatsResult
        {
            ApplicationsCount = stats.ApplicationsCount,
            ShortlistCandidatesCount = stats.ShortlistCandidatesCount,
            UnreadNotificationsCount = stats.UnreadNotificationsCount,
            ResumeTitle = stats.ResumeTitle
        };
    }
}
