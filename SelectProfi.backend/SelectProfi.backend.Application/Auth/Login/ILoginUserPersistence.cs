using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Login;

public interface ILoginUserPersistence
{
    Task<User?> FindByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken);

    Task SaveRefreshSessionAsync(RefreshSession refreshSession, CancellationToken cancellationToken);
}
