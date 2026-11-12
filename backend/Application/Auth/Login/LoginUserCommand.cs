using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Auth.Login;

public sealed class LoginUserCommand : ICommand<LoginUserResult>
{
    public string? Email { get; init; }

    public string? Phone { get; init; }

    public string Password { get; init; } = string.Empty;
}
