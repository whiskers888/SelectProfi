namespace SelectProfi.backend.Application.Auth.Register;

public sealed class RegisterUserResult
{
    public RegisterUserErrorCode ErrorCode { get; init; } = RegisterUserErrorCode.None;

    public string AccessToken { get; init; } = string.Empty;

    public string RefreshToken { get; init; } = string.Empty;
}
