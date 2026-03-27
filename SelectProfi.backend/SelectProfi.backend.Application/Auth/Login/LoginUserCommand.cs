namespace SelectProfi.backend.Application.Auth.Login;

public sealed class LoginUserCommand
{
    public string Email { get; init; } = string.Empty;

    public string Password { get; init; } = string.Empty;
}
