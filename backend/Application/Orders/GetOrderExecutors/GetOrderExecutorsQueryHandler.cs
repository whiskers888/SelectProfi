using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Orders.GetOrderExecutors;

public sealed class GetOrderExecutorsQueryHandler(IGetOrderExecutorsPersistence persistence)
    : IQueryHandler<GetOrderExecutorsQuery, GetOrderExecutorsResult>
{
    public async Task<GetOrderExecutorsResult> HandleAsync(
        GetOrderExecutorsQuery query,
        CancellationToken cancellationToken)
    {
        if (!OrderAccessRules.CanReadOrderExecutors(query.RequesterRole))
        {
            return new GetOrderExecutorsResult
            {
                ErrorCode = GetOrderExecutorsErrorCode.Forbidden
            };
        }

        var executors = await persistence.FindExecutorsAsync(cancellationToken);
        var items = executors
            .Select(executor => new GetOrderExecutorsItemResult
            {
                ExecutorId = executor.Id,
                FullName = $"{executor.FirstName} {executor.LastName}".Trim()
            })
            .ToArray();

        return new GetOrderExecutorsResult
        {
            ErrorCode = GetOrderExecutorsErrorCode.None,
            Items = items
        };
    }
}
