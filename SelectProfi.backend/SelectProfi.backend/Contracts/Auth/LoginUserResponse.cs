namespace SelectProfi.backend.Contracts.Auth;

public sealed class LoginUserResponse
{
    public string AccessToken { get; init; } = string.Empty;

    public string RefreshToken { get; init; } = string.Empty;
}
