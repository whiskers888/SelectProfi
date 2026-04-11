using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Dashboard.GetExecutorDashboardStats;

public sealed class GetExecutorDashboardStatsQuery : IQuery<GetExecutorDashboardStatsResult>
{
    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
