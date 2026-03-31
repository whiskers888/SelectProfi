using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Profile;

namespace SelectProfi.backend.Application.Profile.SwitchMyActiveRole;

public sealed class SwitchMyActiveRoleCommandHandler(ISwitchMyActiveRolePersistence persistence)
    : ICommandHandler<SwitchMyActiveRoleCommand, SwitchMyActiveRoleResult>
{
    public async Task<SwitchMyActiveRoleResult> HandleAsync(
        SwitchMyActiveRoleCommand command,
        CancellationToken cancellationToken)
    {
        var user = await persistence.FindByIdAsync(command.UserId, cancellationToken);
        if (user is null)
            return new SwitchMyActiveRoleResult { ErrorCode = SwitchMyActiveRoleErrorCode.UserNotFound };

        var allowedRoles = ProfileRoleSet.Resolve(user.Role);
        var requestedRole = command.ActiveRole.ToString();
        if (!allowedRoles.Contains(requestedRole, StringComparer.Ordinal))
            return new SwitchMyActiveRoleResult { ErrorCode = SwitchMyActiveRoleErrorCode.ActiveRoleNotAllowed };

        if (user.Role == command.ActiveRole)
            return new SwitchMyActiveRoleResult { ErrorCode = SwitchMyActiveRoleErrorCode.None };

        user.Role = command.ActiveRole;

        var persistenceResult = await persistence.SaveChangesAsync(cancellationToken);
        if (persistenceResult == SwitchMyActiveRolePersistenceResult.Conflict)
            return new SwitchMyActiveRoleResult { ErrorCode = SwitchMyActiveRoleErrorCode.Conflict };

        return new SwitchMyActiveRoleResult { ErrorCode = SwitchMyActiveRoleErrorCode.None };
    }
}
