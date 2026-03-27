namespace SelectProfi.backend.Application.Auth.Refresh;

public sealed class RefreshAuthSessionResult
{
    public RefreshAuthSessionErrorCode ErrorCode { get; init; } = RefreshAuthSessionErrorCode.None;

    public string AccessToken { get; init; } = string.Empty;

    public string RefreshToken { get; init; } = string.Empty;
}
