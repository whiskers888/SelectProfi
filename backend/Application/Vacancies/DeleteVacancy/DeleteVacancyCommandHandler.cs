using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Vacancies.DeleteVacancy;

public sealed class DeleteVacancyCommandHandler(IDeleteVacancyPersistence persistence)
    : ICommandHandler<DeleteVacancyCommand, DeleteVacancyResult>
{
    public async Task<DeleteVacancyResult> HandleAsync(DeleteVacancyCommand command, CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveByIdAsync(command.VacancyId, cancellationToken);
        if (vacancy is null)
            return new DeleteVacancyResult { ErrorCode = DeleteVacancyErrorCode.NotFound };

        if (!CanDelete(command.RequesterRole, command.RequesterUserId, vacancy.ExecutorId))
            return new DeleteVacancyResult { ErrorCode = DeleteVacancyErrorCode.Forbidden };

        var utcNow = DateTime.UtcNow;
        vacancy.DeletedAtUtc = utcNow;
        vacancy.UpdatedAtUtc = utcNow;

        var saveResult = await persistence.SaveChangesAsync(cancellationToken);
        if (saveResult == DeleteVacancyPersistenceResult.Conflict)
            return new DeleteVacancyResult { ErrorCode = DeleteVacancyErrorCode.Conflict };

        return new DeleteVacancyResult { ErrorCode = DeleteVacancyErrorCode.None };
    }

    private static bool CanDelete(UserRole requesterRole, Guid requesterUserId, Guid vacancyExecutorId)
    {
        return requesterRole == UserRole.Executor && requesterUserId == vacancyExecutorId;
    }
}
