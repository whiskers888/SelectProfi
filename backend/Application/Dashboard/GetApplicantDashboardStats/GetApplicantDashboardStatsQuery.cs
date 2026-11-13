using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Dashboard.GetApplicantDashboardStats;

public sealed class GetApplicantDashboardStatsQuery : IQuery<GetApplicantDashboardStatsResult>
{
    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
