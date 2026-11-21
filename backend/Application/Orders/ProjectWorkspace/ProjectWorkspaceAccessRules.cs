using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.ProjectWorkspace;

public static class ProjectWorkspaceAccessRules
{
    public static bool CanRead(UserRole role, Guid requesterUserId, Order order) =>
        role == UserRole.Admin ||
        role == UserRole.Executor && order.ExecutorId == requesterUserId;

    public static bool CanManage(Guid requesterUserId, Order order) =>
        order.ExecutorId == requesterUserId;
}
