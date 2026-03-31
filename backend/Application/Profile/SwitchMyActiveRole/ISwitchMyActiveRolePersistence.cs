using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Profile.SwitchMyActiveRole;

public interface ISwitchMyActiveRolePersistence
{
    Task<User?> FindByIdAsync(Guid userId, CancellationToken cancellationToken);

    Task<SwitchMyActiveRolePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum SwitchMyActiveRolePersistenceResult
{
    Saved = 0,
    Conflict = 1
}
