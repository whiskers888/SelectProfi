using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Profile.GetMyProfile;

public interface IProfileReadPersistence
{
    Task<User?> FindByIdAsync(Guid userId, CancellationToken cancellationToken);
}
