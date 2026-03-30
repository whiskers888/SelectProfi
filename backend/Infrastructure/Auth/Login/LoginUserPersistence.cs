using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Auth.Login;

public sealed class LoginUserPersistence(AppDbContext dbContext) : ILoginUserPersistence
{
    public Task<User?> FindByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken)
    {
        return dbContext.Users.FirstOrDefaultAsync(user => user.NormalizedEmail == normalizedEmail, cancellationToken);
    }

    public async Task SaveRefreshSessionAsync(RefreshSession refreshSession, CancellationToken cancellationToken)
    {
        dbContext.RefreshSessions.Add(refreshSession);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
