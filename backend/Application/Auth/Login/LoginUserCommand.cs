using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Auth.Login;

public sealed class LoginUserCommand : ICommand<LoginUserResult>
{
    public string Email { get; init; } = string.Empty;

    public string Password { get; init; } = string.Empty;
}
