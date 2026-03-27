namespace SelectProfi.backend.Application.Auth.Refresh;

public interface IRefreshAuthSessionUseCase
{
    Task<RefreshAuthSessionResult> ExecuteAsync(RefreshAuthSessionCommand command, CancellationToken cancellationToken);
}
