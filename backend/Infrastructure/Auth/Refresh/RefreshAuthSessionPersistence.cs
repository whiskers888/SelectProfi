using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Auth.Refresh;

public sealed class RefreshAuthSessionPersistence(AppDbContext dbContext) : IRefreshAuthSessionPersistence
{
    public Task<RefreshSession?> FindByTokenHashAsync(string tokenHash, CancellationToken cancellationToken)
    {
        return dbContext.RefreshSessions
            .Include(session => session.User)
            .FirstOrDefaultAsync(session => session.TokenHash == tokenHash, cancellationToken);
    }

    public async Task RotateAsync(RefreshSession currentSession, RefreshSession nextSession, CancellationToken cancellationToken)
    {
        dbContext.RefreshSessions.Add(nextSession);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
