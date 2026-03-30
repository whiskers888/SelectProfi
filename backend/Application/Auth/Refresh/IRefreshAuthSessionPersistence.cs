using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Refresh;

public interface IRefreshAuthSessionPersistence
{
    Task<RefreshSession?> FindByTokenHashAsync(string tokenHash, CancellationToken cancellationToken);

    Task RotateAsync(RefreshSession currentSession, RefreshSession nextSession, CancellationToken cancellationToken);
}
