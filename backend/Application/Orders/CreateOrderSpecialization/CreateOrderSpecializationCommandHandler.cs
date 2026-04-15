using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.CreateOrderSpecialization;

public sealed class CreateOrderSpecializationCommandHandler(ICreateOrderSpecializationPersistence persistence)
    : ICommandHandler<CreateOrderSpecializationCommand, CreateOrderSpecializationResult>
{
    public async Task<CreateOrderSpecializationResult> HandleAsync(
        CreateOrderSpecializationCommand command,
        CancellationToken cancellationToken)
    {
        var utcNow = DateTime.UtcNow;
        var specialization = new OrderSpecialization
        {
            Id = Guid.NewGuid(),
            Name = command.Name.Trim(),
            IsActive = true,
            SortOrder = command.SortOrder,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        var createResult = await persistence.CreateAsync(specialization, cancellationToken);
        if (createResult == CreateOrderSpecializationPersistenceResult.Conflict)
            return new CreateOrderSpecializationResult { ErrorCode = CreateOrderSpecializationErrorCode.Conflict };

        return new CreateOrderSpecializationResult
        {
            ErrorCode = CreateOrderSpecializationErrorCode.None,
            SpecializationId = specialization.Id,
            Name = specialization.Name,
            IsActive = specialization.IsActive,
            SortOrder = specialization.SortOrder,
            CreatedAtUtc = specialization.CreatedAtUtc,
            UpdatedAtUtc = specialization.UpdatedAtUtc
        };
    }
}
