using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Profile.UpdateMyProfile;

public interface IProfileWritePersistence
{
    Task<User?> FindByIdAsync(Guid userId, CancellationToken cancellationToken);

    Task<bool> PhoneExistsForAnotherUserAsync(string normalizedPhone, Guid userId, CancellationToken cancellationToken);

    Task<ProfileWritePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken);
}

public enum ProfileWritePersistenceResult
{
    Saved = 0,
    Conflict = 1
}
