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
        var resolvedRoles = request.ResolveRoles().Select(MapRole).ToArray();
        if (resolvedRoles.Length == 0)
            throw new InvalidOperationException("At least one role must be provided.");

        return new RegisterUserCommand
        {
            Email = request.Email,
            Phone = request.Phone,
            Password = request.Password,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = resolvedRoles[0],
            Roles = resolvedRoles,
            CustomerRegistration = MapCustomerRegistration(request.CustomerRegistration),
            OfferAcceptance = MapOfferAcceptance(request.OfferAcceptance),
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

    private static RegisterCustomerPayload? MapCustomerRegistration(CustomerRegistrationRequest? customerRegistration)
    {
        if (customerRegistration is null)
            return null;

        return new RegisterCustomerPayload
        {
            Inn = customerRegistration.Inn,
            LegalForm = MapCustomerLegalForm(customerRegistration.LegalForm),
            Egrn = customerRegistration.Egrn,
            Egrnip = customerRegistration.Egrnip,
            CompanyName = customerRegistration.CompanyName
        };
    }

    private static RegisterOfferAcceptancePayload? MapOfferAcceptance(OfferAcceptanceRequest? offerAcceptance)
    {
        if (offerAcceptance is null)
            return null;

        return new RegisterOfferAcceptancePayload
        {
            Accepted = offerAcceptance.Accepted,
            Version = offerAcceptance.Version
        };
    }

    private static RegisterCustomerLegalForm? MapCustomerLegalForm(SelectProfi.backend.Contracts.Auth.CustomerLegalForm? legalForm)
    {
        if (!legalForm.HasValue)
            return null;

        return legalForm.Value switch
        {
            SelectProfi.backend.Contracts.Auth.CustomerLegalForm.Ooo => RegisterCustomerLegalForm.Ooo,
            SelectProfi.backend.Contracts.Auth.CustomerLegalForm.Ip => RegisterCustomerLegalForm.Ip,
            _ => throw new ArgumentOutOfRangeException(nameof(legalForm), legalForm.Value, "Unsupported legal form.")
        };
    }
}
