using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetMyOrders;

public sealed class GetMyOrdersQueryHandler(IGetMyOrdersPersistence persistence)
    : IQueryHandler<GetMyOrdersQuery, GetOrdersResult>
{
    public async Task<GetOrdersResult> HandleAsync(GetMyOrdersQuery query, CancellationToken cancellationToken)
    {
        if (!OrderAccessRules.CanReadOrders(query.RequesterRole) || query.RequesterRole != UserRole.Executor)
            return new GetOrdersResult { ErrorCode = GetOrdersErrorCode.Forbidden };

        var orders = await persistence.FindMyOrdersAsync(
            query.RequesterUserId,
            query.IncludeArchived,
            query.Limit,
            query.Offset,
            cancellationToken);

        var items = orders.Select(order => new GetOrdersItemResult
        {
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            ExecutorId = order.ExecutorId,
            Title = order.Title,
            Description = order.Description,
            SpecializationId = order.SpecializationId,
            Specialization = order.Specialization,
            Price = order.Price,
            CustomerCompanyName = order.CustomerCompanyName,
            RequestedCandidatesCount = order.RequestedCandidatesCount,
            Status = order.Status,
            CreatedAtUtc = order.CreatedAtUtc,
            UpdatedAtUtc = order.UpdatedAtUtc,
            DeletedAtUtc = order.DeletedAtUtc
        }).ToArray();

        return new GetOrdersResult
        {
            ErrorCode = GetOrdersErrorCode.None,
            Items = items,
            Limit = query.Limit,
            Offset = query.Offset
        };
    }
}

