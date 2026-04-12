using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Orders.GetOrderResponses;

public sealed class GetOrderResponsesQueryHandler(IGetOrderResponsesPersistence persistence)
    : IQueryHandler<GetOrderResponsesQuery, GetOrderResponsesResult>
{
    public async Task<GetOrderResponsesResult> HandleAsync(
        GetOrderResponsesQuery query,
        CancellationToken cancellationToken)
    {
        var order = await persistence.FindOrderByIdAsync(query.OrderId, cancellationToken);
        if (order is null || order.DeletedAtUtc is not null)
            return new GetOrderResponsesResult { ErrorCode = GetOrderResponsesErrorCode.NotFound };

        if (!OrderAccessRules.CanManageOrderResponses(query.RequesterRole, query.RequesterUserId, order.CustomerId))
            return new GetOrderResponsesResult { ErrorCode = GetOrderResponsesErrorCode.Forbidden };

        var items = await persistence.FindByOrderIdAsync(query.OrderId, cancellationToken);

        return new GetOrderResponsesResult
        {
            ErrorCode = GetOrderResponsesErrorCode.None,
            Items = items.Select(item => new GetOrderResponsesItemResult
            {
                ExecutorId = item.ExecutorId,
                ExecutorFullName = item.ExecutorFullName,
                ExecutorGrade = item.ExecutorGrade,
                ExecutorProjectTitle = item.ExecutorProjectTitle,
                ExecutorProjectCompanyName = item.ExecutorProjectCompanyName,
                ExecutorExperienceSummary = item.ExecutorExperienceSummary,
                Status = item.Status,
                CreatedAtUtc = item.CreatedAtUtc,
                UpdatedAtUtc = item.UpdatedAtUtc
            }).ToArray()
        };
    }
}
