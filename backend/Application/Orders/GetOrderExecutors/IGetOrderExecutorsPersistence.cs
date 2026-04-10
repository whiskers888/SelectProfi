using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetOrderExecutors;

public interface IGetOrderExecutorsPersistence
{
    Task<IReadOnlyList<User>> FindExecutorsAsync(CancellationToken cancellationToken);
}
