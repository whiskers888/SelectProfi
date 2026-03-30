using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Auth.Refresh;

public sealed class RefreshAuthSessionCommand : ICommand<RefreshAuthSessionResult>
{
    public string RefreshToken { get; init; } = string.Empty;
}
