using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Register;

public sealed class RegisterUserCommand
{
    public string Email { get; init; } = string.Empty;

    public string? Phone { get; init; }

    public string Password { get; init; } = string.Empty;

    public string FirstName { get; init; } = string.Empty;

    public string LastName { get; init; } = string.Empty;

    public UserRole Role { get; init; }

    public bool RequireEmailVerification { get; init; }

    public bool RequirePhoneVerification { get; init; }
}
