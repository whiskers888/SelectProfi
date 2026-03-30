using Riok.Mapperly.Abstractions;
using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Configuration;
using SelectProfi.backend.Contracts.Auth;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Mappings;

[Mapper]
public static partial class AuthRequestMapper
{
    public static partial LoginUserCommand ToCommand(this LoginUserRequest request);

    public static partial RefreshAuthSessionCommand ToCommand(this RefreshTokenRequest request);

    public static RegisterUserCommand ToCommand(this RegisterUserRequest request, AuthFeatureFlagsOptions featureFlags)
    {
        return new RegisterUserCommand
        {
            Email = request.Email,
            Phone = request.Phone,
            Password = request.Password,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = MapRole(request.Role),
            RequireEmailVerification = featureFlags.RequireEmailVerification,
            RequirePhoneVerification = featureFlags.RequirePhoneVerification
        };
    }

    private static UserRole MapRole(RegisterUserRole role)
    {
        return role switch
        {
            RegisterUserRole.Applicant => UserRole.Applicant,
            RegisterUserRole.Executor => UserRole.Executor,
            RegisterUserRole.Customer => UserRole.Customer,
            _ => throw new ArgumentOutOfRangeException(nameof(role), role, "Unsupported role.")
        };
    }
}
