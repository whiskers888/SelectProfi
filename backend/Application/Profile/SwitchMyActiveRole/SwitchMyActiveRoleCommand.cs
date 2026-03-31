using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Profile.SwitchMyActiveRole;

public sealed class SwitchMyActiveRoleCommand : ICommand<SwitchMyActiveRoleResult>
{
    public Guid UserId { get; init; }

    public UserRole ActiveRole { get; init; }
}
