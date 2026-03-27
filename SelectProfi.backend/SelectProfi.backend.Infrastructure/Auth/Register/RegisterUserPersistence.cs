using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Auth.Register;

public sealed class RegisterUserPersistence(AppDbContext dbContext) : IRegisterUserPersistence
{
    public Task<bool> EmailExistsAsync(string normalizedEmail, CancellationToken cancellationToken)
    {
        return dbContext.Users.AnyAsync(user => user.NormalizedEmail == normalizedEmail, cancellationToken);
    }

    public Task<bool> PhoneExistsAsync(string normalizedPhone, CancellationToken cancellationToken)
    {
        return dbContext.Users.AnyAsync(user => user.NormalizedPhone == normalizedPhone, cancellationToken);
    }

    public async Task<RegisterUserPersistenceResult> CreateAsync(
        User user,
        RefreshSession refreshSession,
        CancellationToken cancellationToken)
    {
        dbContext.Users.Add(user);
        dbContext.RefreshSessions.Add(refreshSession);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return RegisterUserPersistenceResult.Created;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return RegisterUserPersistenceResult.Conflict;
        }
    }

    private static bool IsUniqueViolation(DbUpdateException exception)
    {
        var innerException = exception.InnerException;
        if (innerException is null)
            return false;

        var sqlStateProperty = innerException.GetType().GetProperty("SqlState");
        var sqlStateValue = sqlStateProperty?.GetValue(innerException) as string;

        return string.Equals(sqlStateValue, "23505", StringComparison.Ordinal);
    }
}
