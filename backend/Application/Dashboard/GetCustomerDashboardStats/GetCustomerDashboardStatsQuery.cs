using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Dashboard.GetCustomerDashboardStats;

public sealed class GetCustomerDashboardStatsQuery : IQuery<GetCustomerDashboardStatsResult>
{
    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
