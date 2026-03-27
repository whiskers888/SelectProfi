using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Register;

public interface IRegisterUserPersistence
{
    Task<bool> EmailExistsAsync(string normalizedEmail, CancellationToken cancellationToken);

    Task<bool> PhoneExistsAsync(string normalizedPhone, CancellationToken cancellationToken);

    Task<RegisterUserPersistenceResult> CreateAsync(
        User user,
        RefreshSession refreshSession,
        CancellationToken cancellationToken);
}

public enum RegisterUserPersistenceResult
{
    Created = 0,
    Conflict = 1
}
