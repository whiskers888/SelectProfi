namespace SelectProfi.backend.Application.Auth.Refresh;

public sealed class RefreshAuthSessionCommand
{
    public string RefreshToken { get; init; } = string.Empty;
}
