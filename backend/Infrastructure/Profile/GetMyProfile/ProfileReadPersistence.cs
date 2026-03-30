using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Profile.GetMyProfile;

public sealed class ProfileReadPersistence(AppDbContext dbContext) : IProfileReadPersistence
{
    public Task<User?> FindByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return dbContext.Users.FirstOrDefaultAsync(user => user.Id == userId, cancellationToken);
    }
}
