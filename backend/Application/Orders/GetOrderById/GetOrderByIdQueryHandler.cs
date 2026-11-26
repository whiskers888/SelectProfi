using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.GetOrderById;

public sealed class GetOrderByIdQueryHandler(IGetOrderByIdPersistence persistence)
    : IQueryHandler<GetOrderByIdQuery, GetOrderByIdResult>
{
    public async Task<GetOrderByIdResult> HandleAsync(GetOrderByIdQuery query, CancellationToken cancellationToken)
    {
        var order = await persistence.FindActiveByIdAsync(query.OrderId, cancellationToken);
        if (order is null)
            return new GetOrderByIdResult { ErrorCode = GetOrderByIdErrorCode.NotFound };

        var hasOwnResponse = query.RequesterRole == UserRole.Executor &&
            await persistence.HasExecutorRespondedAsync(order.Id, query.RequesterUserId, cancellationToken);
        if (!OrderAccessRules.CanReadOrder(
                query.RequesterRole, query.RequesterUserId, order.CustomerId, order.ExecutorId, hasOwnResponse))
            return new GetOrderByIdResult { ErrorCode = GetOrderByIdErrorCode.Forbidden };

        return new GetOrderByIdResult
        {
            ErrorCode = GetOrderByIdErrorCode.None,
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            ExecutorId = order.ExecutorId,
            Title = order.Title,
            Description = order.Description,
            Location = order.Location,
            EmployeeCompensation = order.EmployeeCompensation,
            WorkMode = order.WorkMode,
            SalaryMin = order.SalaryMin,
            SalaryMax = order.SalaryMax,
            FulfillmentDays = order.FulfillmentDays,
            WarrantyMonths = order.WarrantyMonths,
            GuaranteeReward = order.GuaranteeReward,
            Functional = order.Functional,
            Requirements = order.Requirements,
            OtherConditions = order.OtherConditions,
            // @dvnull: Ранее detail-query не возвращал specialization/price; добавлен проброс отдельных полей заказа.
            SpecializationId = order.SpecializationId,
            Specialization = order.Specialization,
            Price = order.Price,
            ServiceCommissionRate = order.ServiceCommissionRate,
            CustomerCompanyName = order.CustomerCompanyName,
            RequestedCandidatesCount = order.RequestedCandidatesCount,
            Status = order.Status,
            CreatedAtUtc = order.CreatedAtUtc,
            UpdatedAtUtc = order.UpdatedAtUtc,
            DueDate = order.DueDate,
            CompletedAtUtc = order.CompletedAtUtc
        };
    }
}
