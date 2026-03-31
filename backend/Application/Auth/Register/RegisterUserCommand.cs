using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Register;

public sealed class RegisterUserCommand : ICommand<RegisterUserResult>
{
    public string Email { get; init; } = string.Empty;

    public string? Phone { get; init; }

    public string Password { get; init; } = string.Empty;

    public string FirstName { get; init; } = string.Empty;

    public string LastName { get; init; } = string.Empty;

    public UserRole Role { get; init; }

    public IReadOnlyList<UserRole> Roles { get; init; } = [];

    public RegisterCustomerPayload? CustomerRegistration { get; init; }

    public RegisterOfferAcceptancePayload? OfferAcceptance { get; init; }

    public bool RequireEmailVerification { get; init; }

    public bool RequirePhoneVerification { get; init; }
}

public sealed class RegisterCustomerPayload
{
    public string Inn { get; init; } = string.Empty;

    public RegisterCustomerLegalForm? LegalForm { get; init; }

    public string? Egrn { get; init; }

    public string? Egrnip { get; init; }

    public string? CompanyName { get; init; }
}

public sealed class RegisterOfferAcceptancePayload
{
    public bool Accepted { get; init; }

    public string Version { get; init; } = string.Empty;
}

public enum RegisterCustomerLegalForm
{
    Ooo = 1,
    Ip = 2
}
