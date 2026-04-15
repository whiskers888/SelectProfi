using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Orders.UpdateOrderSpecialization;

public sealed class UpdateOrderSpecializationCommandHandler(IUpdateOrderSpecializationPersistence persistence)
    : ICommandHandler<UpdateOrderSpecializationCommand, UpdateOrderSpecializationResult>
{
    public async Task<UpdateOrderSpecializationResult> HandleAsync(
        UpdateOrderSpecializationCommand command,
        CancellationToken cancellationToken)
    {
        var specialization = await persistence.FindByIdAsync(command.SpecializationId, cancellationToken);
        if (specialization is null)
            return new UpdateOrderSpecializationResult { ErrorCode = UpdateOrderSpecializationErrorCode.NotFound };

        if (command.Name is not null)
            specialization.Name = command.Name.Trim();

        if (command.IsActive.HasValue)
            specialization.IsActive = command.IsActive.Value;

        if (command.SortOrder.HasValue)
            specialization.SortOrder = command.SortOrder.Value;

        specialization.UpdatedAtUtc = DateTime.UtcNow;

        var saveResult = await persistence.SaveChangesAsync(cancellationToken);
        if (saveResult == UpdateOrderSpecializationPersistenceResult.Conflict)
            return new UpdateOrderSpecializationResult { ErrorCode = UpdateOrderSpecializationErrorCode.Conflict };

        return new UpdateOrderSpecializationResult
        {
            ErrorCode = UpdateOrderSpecializationErrorCode.None,
            SpecializationId = specialization.Id,
            Name = specialization.Name,
            IsActive = specialization.IsActive,
            SortOrder = specialization.SortOrder,
            CreatedAtUtc = specialization.CreatedAtUtc,
            UpdatedAtUtc = specialization.UpdatedAtUtc
        };
    }
}
