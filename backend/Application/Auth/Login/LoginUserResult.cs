namespace SelectProfi.backend.Application.Auth.Login;

public sealed class LoginUserResult
{
    public LoginUserErrorCode ErrorCode { get; init; } = LoginUserErrorCode.None;

    public string AccessToken { get; init; } = string.Empty;

    public string RefreshToken { get; init; } = string.Empty;
}
