using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.GetOrderExecutors;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.GetOrderExecutors;

public sealed class GetOrderExecutorsPersistence(AppDbContext dbContext) : IGetOrderExecutorsPersistence
{
    public async Task<IReadOnlyList<User>> FindExecutorsAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .AsNoTracking()
            .Where(user => user.Role == UserRole.Executor)
            .OrderBy(user => user.FirstName)
            .ThenBy(user => user.LastName)
            .ToArrayAsync(cancellationToken);
    }
}
