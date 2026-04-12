using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Orders.GetOrderResponses;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Orders.GetOrderResponses;

public sealed class GetOrderResponsesPersistence(AppDbContext dbContext) : IGetOrderResponsesPersistence
{
    public Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return dbContext.Orders.AsNoTracking().FirstOrDefaultAsync(order => order.Id == orderId, cancellationToken);
    }

    public async Task<IReadOnlyList<GetOrderResponsesItemSnapshot>> FindByOrderIdAsync(
        Guid orderId,
        CancellationToken cancellationToken)
    {
        return await dbContext.OrderExecutorResponses
            .AsNoTracking()
            .Where(response => response.OrderId == orderId)
            .Join(
                dbContext.Users.AsNoTracking(),
                response => response.ExecutorId,
                user => user.Id,
                (response, user) => new GetOrderResponsesItemSnapshot
                {
                    ExecutorId = response.ExecutorId,
                    ExecutorFullName = $"{user.FirstName} {user.LastName}".Trim(),
                    ExecutorGrade = user.ExecutorGrade,
                    ExecutorProjectTitle = user.ExecutorProjectTitle,
                    ExecutorProjectCompanyName = user.ExecutorProjectCompanyName,
                    ExecutorExperienceSummary = user.ExecutorExperienceSummary,
                    Status = response.Status,
                    CreatedAtUtc = response.CreatedAtUtc,
                    UpdatedAtUtc = response.UpdatedAtUtc
                })
            .OrderByDescending(item => item.CreatedAtUtc)
            .ToArrayAsync(cancellationToken);
    }
}
