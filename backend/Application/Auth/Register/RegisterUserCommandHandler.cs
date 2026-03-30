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
}
