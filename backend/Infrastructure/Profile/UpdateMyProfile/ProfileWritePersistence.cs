using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Profile.UpdateMyProfile;

public sealed class ProfileWritePersistence(AppDbContext dbContext) : IProfileWritePersistence
{
    public Task<User?> FindByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return dbContext.Users.FirstOrDefaultAsync(user => user.Id == userId, cancellationToken);
    }

    public Task<bool> PhoneExistsForAnotherUserAsync(string normalizedPhone, Guid userId, CancellationToken cancellationToken)
    {
        return dbContext.Users.AnyAsync(
            user => user.NormalizedPhone == normalizedPhone && user.Id != userId,
            cancellationToken);
    }

    public async Task<ProfileWritePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return ProfileWritePersistenceResult.Saved;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            return ProfileWritePersistenceResult.Conflict;
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
