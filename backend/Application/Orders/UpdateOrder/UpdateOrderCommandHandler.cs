using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Orders.UpdateOrder;

public sealed class UpdateOrderCommandHandler(IUpdateOrderPersistence persistence)
    : ICommandHandler<UpdateOrderCommand, UpdateOrderResult>
{
    public async Task<UpdateOrderResult> HandleAsync(UpdateOrderCommand command, CancellationToken cancellationToken)
    {
        var order = await persistence.FindByIdAsync(command.OrderId, cancellationToken);
        if (order is null)
            return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.NotFound };

        if (!OrderAccessRules.CanManageOrder(command.RequesterRole, command.RequesterUserId, order.CustomerId))
            return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.Forbidden };

        // @dvnull: Ранее PATCH обновлял только активные заказы; теперь статусный PATCH разрешает восстановление soft-deleted заказа из архива.
        if (order.DeletedAtUtc is not null)
        {
            if (!command.Status.HasValue)
                return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.NotFound };

            order.DeletedAtUtc = null;
        }

        if (command.Title is not null)
            order.Title = command.Title.Trim();

        if (command.Description is not null)
            order.Description = command.Description.Trim();

        if (command.Location is not null)
            order.Location = command.Location.Trim();

        if (command.EmployeeCompensation is not null)
            order.EmployeeCompensation = command.EmployeeCompensation.Trim();

        if (command.Functional is not null)
            order.Functional = command.Functional.Trim();

        if (command.Requirements is not null)
            order.Requirements = command.Requirements.Trim();

        if (command.OtherConditions is not null)
            order.OtherConditions = command.OtherConditions.Trim();

        if (command.SpecializationId.HasValue)
        {
            var specializationSnapshot = await persistence.FindActiveSpecializationByIdAsync(
                command.SpecializationId.Value,
                cancellationToken);
            if (specializationSnapshot is null)
                return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.SpecializationNotFound };

            order.SpecializationId = specializationSnapshot.SpecializationId;
            order.Specialization = specializationSnapshot.Name;
        }

        // @dvnull: Ранее PATCH заказа не обновлял отдельные specialization/price; добавлено обновление новых атрибутов.
        if (!command.SpecializationId.HasValue && command.Specialization is not null)
        {
            // @dvnull: Ручное текстовое обновление specialization сбрасывает dictionary-ссылку, чтобы не держать несогласованные данные.
            order.SpecializationId = null;
            order.Specialization = command.Specialization.Trim();
        }

        if (command.Price.HasValue && order.ExecutorId.HasValue && command.RequesterRole != UserRole.Admin)
            return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.PriceLocked };

        if (command.Price.HasValue)
            order.Price = command.Price.Value;

        if (command.ExecutorId.HasValue)
        {
            if (order.Price <= 0m)
                return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.PriceRequired };

            var executorExists = await persistence.ExecutorExistsAsync(command.ExecutorId.Value, cancellationToken);
            if (!executorExists)
                return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.ExecutorNotFound };

            order.ExecutorId = command.ExecutorId.Value;
            order.ServiceCommissionRate ??= command.ServiceCommissionRate;
        }

        if (command.Status.HasValue)
            order.Status = command.Status.Value;

        order.UpdatedAtUtc = DateTime.UtcNow;

        var saveResult = await persistence.SaveChangesAsync(cancellationToken);
        if (saveResult == UpdateOrderPersistenceResult.Conflict)
            return new UpdateOrderResult { ErrorCode = UpdateOrderErrorCode.Conflict };

        return new UpdateOrderResult
        {
            ErrorCode = UpdateOrderErrorCode.None,
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            ExecutorId = order.ExecutorId,
            Title = order.Title,
            Description = order.Description,
            Location = order.Location,
            EmployeeCompensation = order.EmployeeCompensation,
            Functional = order.Functional,
            Requirements = order.Requirements,
            OtherConditions = order.OtherConditions,
            SpecializationId = order.SpecializationId,
            Specialization = order.Specialization,
            Price = order.Price,
            ServiceCommissionRate = order.ServiceCommissionRate,
            CustomerCompanyName = order.CustomerCompanyName,
            RequestedCandidatesCount = order.RequestedCandidatesCount,
            Status = order.Status,
            CreatedAtUtc = order.CreatedAtUtc,
            UpdatedAtUtc = order.UpdatedAtUtc
        };
    }
}
