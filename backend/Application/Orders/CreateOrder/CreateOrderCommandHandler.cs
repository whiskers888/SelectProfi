using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Orders;
using Microsoft.Extensions.Options;

namespace SelectProfi.backend.Application.Orders.CreateOrder;

public sealed class CreateOrderCommandHandler(
    ICreateOrderPersistence persistence,
    IOptions<OrderCandidateRequirementsOptions> requirementsOptions)
    : ICommandHandler<CreateOrderCommand, CreateOrderResult>
{
    public async Task<CreateOrderResult> HandleAsync(CreateOrderCommand command, CancellationToken cancellationToken)
    {
        var customerSnapshot = await persistence.FindCustomerSnapshotAsync(command.CustomerId, cancellationToken);
        if (customerSnapshot is null)
            return new CreateOrderResult { ErrorCode = CreateOrderErrorCode.CustomerNotFound };

        var customerCompanyName = customerSnapshot.CompanyName?.Trim();
        if (string.IsNullOrWhiteSpace(customerCompanyName))
            return new CreateOrderResult { ErrorCode = CreateOrderErrorCode.CustomerCompanyNameMissing };

        // @dvnull: Ранее минимум запрошенных кандидатов не контролировался в create-flow; теперь порог валидируется по appsettings.
        if (command.RequestedCandidatesCount < requirementsOptions.Value.MinRequestedCandidatesCount)
        {
            return new CreateOrderResult
            {
                ErrorCode = CreateOrderErrorCode.RequestedCandidatesCountTooLow
            };
        }

        Guid? specializationId = null;
        var specialization = command.Specialization.Trim();
        if (command.SpecializationId.HasValue)
        {
            var specializationSnapshot = await persistence.FindActiveSpecializationByIdAsync(
                command.SpecializationId.Value,
                cancellationToken);
            if (specializationSnapshot is null)
                return new CreateOrderResult { ErrorCode = CreateOrderErrorCode.SpecializationNotFound };

            specializationId = specializationSnapshot.SpecializationId;
            specialization = specializationSnapshot.Name;
        }

        var utcNow = DateTime.UtcNow;
        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = command.CustomerId,
            ExecutorId = null,
            Title = command.Title.Trim(),
            Description = command.Description.Trim(),
            // @dvnull: Ранее create-flow не выделял specialization/price в отдельные поля; добавлено сохранение новых колонок заказа.
            SpecializationId = specializationId,
            Specialization = specialization,
            Price = command.Price,
            CustomerCompanyName = customerCompanyName,
            RequestedCandidatesCount = command.RequestedCandidatesCount,
            Status = OrderStatus.Active,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        var createResult = await persistence.CreateAsync(order, cancellationToken);
        if (createResult == CreateOrderPersistenceResult.Conflict)
            return new CreateOrderResult { ErrorCode = CreateOrderErrorCode.Conflict };

        return new CreateOrderResult
        {
            ErrorCode = CreateOrderErrorCode.None,
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
            UpdatedAtUtc = order.UpdatedAtUtc
        };
    }
}
