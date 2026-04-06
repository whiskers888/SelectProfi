using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Vacancies.UpdateVacancyStatus;

public sealed class UpdateVacancyStatusCommandHandler(IUpdateVacancyStatusPersistence persistence)
    : ICommandHandler<UpdateVacancyStatusCommand, UpdateVacancyStatusResult>
{
    public async Task<UpdateVacancyStatusResult> HandleAsync(
        UpdateVacancyStatusCommand command,
        CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveByIdAsync(command.VacancyId, cancellationToken);
        if (vacancy is null)
            return new UpdateVacancyStatusResult { ErrorCode = UpdateVacancyStatusErrorCode.NotFound };

        if (!VacancyAccessRules.CanChangeVacancyStatus(
                command.RequesterRole,
                command.RequesterUserId,
                vacancy.CustomerId,
                vacancy.ExecutorId,
                command.Status))
            return new UpdateVacancyStatusResult { ErrorCode = UpdateVacancyStatusErrorCode.Forbidden };

        if (!VacancyAccessRules.IsVacancyStatusTransitionAllowed(vacancy.Status, command.Status))
            return new UpdateVacancyStatusResult { ErrorCode = UpdateVacancyStatusErrorCode.InvalidTransition };

        if (vacancy.Status != command.Status)
        {
            vacancy.Status = command.Status;
            vacancy.UpdatedAtUtc = DateTime.UtcNow;

            var saveResult = await persistence.SaveChangesAsync(cancellationToken);
            if (saveResult == UpdateVacancyStatusPersistenceResult.Conflict)
                return new UpdateVacancyStatusResult { ErrorCode = UpdateVacancyStatusErrorCode.Conflict };
        }

        return new UpdateVacancyStatusResult
        {
            ErrorCode = UpdateVacancyStatusErrorCode.None,
            VacancyId = vacancy.Id,
            OrderId = vacancy.OrderId,
            CustomerId = vacancy.CustomerId,
            ExecutorId = vacancy.ExecutorId,
            Title = vacancy.Title,
            Description = vacancy.Description,
            Status = vacancy.Status,
            CreatedAtUtc = vacancy.CreatedAtUtc,
            UpdatedAtUtc = vacancy.UpdatedAtUtc
        };
    }
}
