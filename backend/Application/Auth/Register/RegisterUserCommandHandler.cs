using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Register;

public sealed class RegisterUserCommandHandler(
    IRegisterUserPersistence persistence,
    IPasswordHasher passwordHasher,
    ITokenPairIssuer tokenPairIssuer) : ICommandHandler<RegisterUserCommand, RegisterUserResult>
{
    public async Task<RegisterUserResult> HandleAsync(RegisterUserCommand command, CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(command.Email);
        var normalizedPhone = NormalizePhone(command.Phone);

        if (await persistence.EmailExistsAsync(normalizedEmail, cancellationToken))
            return new RegisterUserResult { ErrorCode = RegisterUserErrorCode.EmailAlreadyExists };

        if (normalizedPhone is not null && await persistence.PhoneExistsAsync(normalizedPhone, cancellationToken))
            return new RegisterUserResult { ErrorCode = RegisterUserErrorCode.PhoneAlreadyExists };

        var utcNow = DateTime.UtcNow;
        var normalizedCustomerRegistration = NormalizeCustomerRegistration(command.CustomerRegistration);
        var normalizedOfferAcceptance = NormalizeOfferAcceptance(command.OfferAcceptance);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = command.Email.Trim(),
            NormalizedEmail = normalizedEmail,
            Phone = normalizedPhone,
            NormalizedPhone = normalizedPhone,
            PasswordHash = passwordHasher.HashPassword(command.Password),
            FirstName = command.FirstName.Trim(),
            LastName = command.LastName.Trim(),
            Role = command.Role,
            CustomerInn = normalizedCustomerRegistration?.Inn,
            CustomerLegalForm = MapCustomerLegalForm(normalizedCustomerRegistration?.LegalForm),
            CustomerEgrn = normalizedCustomerRegistration?.Egrn,
            CustomerEgrnip = normalizedCustomerRegistration?.Egrnip,
            CustomerCompanyName = normalizedCustomerRegistration?.CompanyName,
            CustomerOfferAccepted = normalizedOfferAcceptance?.Accepted ?? false,
            CustomerOfferVersion = normalizedOfferAcceptance?.Accepted == true ? normalizedOfferAcceptance.Version : null,
            CustomerOfferAcceptedAtUtc = normalizedOfferAcceptance?.Accepted == true ? utcNow : null,
            IsEmailVerified = !command.RequireEmailVerification,
            IsPhoneVerified = normalizedPhone is null || !command.RequirePhoneVerification,
            CreatedAtUtc = utcNow
        };

        var tokens = tokenPairIssuer.Issue(user, utcNow);
        var refreshSession = new RefreshSession
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokens.RefreshTokenHash,
            ExpiresAtUtc = tokens.RefreshTokenExpiresAtUtc,
            CreatedAtUtc = utcNow
        };

        var persistenceResult = await persistence.CreateAsync(user, refreshSession, cancellationToken);
        if (persistenceResult == RegisterUserPersistenceResult.Conflict)
            return new RegisterUserResult { ErrorCode = RegisterUserErrorCode.UserAlreadyExists };

        return new RegisterUserResult
        {
            ErrorCode = RegisterUserErrorCode.None,
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken
        };
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToUpperInvariant();
    }

    private static string? NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return null;

        return phone.Trim();
    }

    private static RegisterCustomerPayload? NormalizeCustomerRegistration(RegisterCustomerPayload? payload)
    {
        if (payload is null)
            return null;

        return new RegisterCustomerPayload
        {
            Inn = payload.Inn.Trim(),
            LegalForm = payload.LegalForm,
            Egrn = NormalizeOptional(payload.Egrn),
            Egrnip = NormalizeOptional(payload.Egrnip),
            CompanyName = NormalizeOptional(payload.CompanyName)
        };
    }

    private static RegisterOfferAcceptancePayload? NormalizeOfferAcceptance(RegisterOfferAcceptancePayload? payload)
    {
        if (payload is null)
            return null;

        return new RegisterOfferAcceptancePayload
        {
            Accepted = payload.Accepted,
            Version = payload.Version.Trim()
        };
    }

    private static string? NormalizeOptional(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return value.Trim();
    }

    private static CustomerLegalForm? MapCustomerLegalForm(RegisterCustomerLegalForm? legalForm)
    {
        if (!legalForm.HasValue)
            return null;

        return legalForm.Value switch
        {
            RegisterCustomerLegalForm.Ooo => CustomerLegalForm.Ooo,
            RegisterCustomerLegalForm.Ip => CustomerLegalForm.Ip,
            _ => throw new ArgumentOutOfRangeException(nameof(legalForm), legalForm.Value, "Unsupported legal form.")
        };
    }
}
