using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Vacancies.UpdateVacancy;

public sealed class UpdateVacancyCommandHandler(IUpdateVacancyPersistence persistence)
    : ICommandHandler<UpdateVacancyCommand, UpdateVacancyResult>
{
    public async Task<UpdateVacancyResult> HandleAsync(UpdateVacancyCommand command, CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveByIdAsync(command.VacancyId, cancellationToken);
        if (vacancy is null)
            return new UpdateVacancyResult { ErrorCode = UpdateVacancyErrorCode.NotFound };

        if (!VacancyAccessRules.CanManageVacancyByExecutor(command.RequesterRole, command.RequesterUserId, vacancy.ExecutorId))
            return new UpdateVacancyResult { ErrorCode = UpdateVacancyErrorCode.Forbidden };

        if (command.Title is not null)
            vacancy.Title = command.Title.Trim();

        if (command.Description is not null)
            vacancy.Description = command.Description.Trim();

        vacancy.UpdatedAtUtc = DateTime.UtcNow;

        var saveResult = await persistence.SaveChangesAsync(cancellationToken);
        if (saveResult == UpdateVacancyPersistenceResult.Conflict)
            return new UpdateVacancyResult { ErrorCode = UpdateVacancyErrorCode.Conflict };

        return new UpdateVacancyResult
        {
            ErrorCode = UpdateVacancyErrorCode.None,
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
