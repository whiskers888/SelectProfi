using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Vacancies.CreateVacancy;

public sealed class CreateVacancyCommandHandler(ICreateVacancyPersistence persistence)
    : ICommandHandler<CreateVacancyCommand, CreateVacancyResult>
{
    public async Task<CreateVacancyResult> HandleAsync(CreateVacancyCommand command, CancellationToken cancellationToken)
    {
        var order = await persistence.FindActiveOrderByIdAsync(command.OrderId, cancellationToken);
        if (order is null)
            return new CreateVacancyResult { ErrorCode = CreateVacancyErrorCode.OrderNotFound };

        if (!CanCreate(command.RequesterRole, command.RequesterUserId, order.ExecutorId))
            return new CreateVacancyResult { ErrorCode = CreateVacancyErrorCode.Forbidden };

        var activeVacancyExists = await persistence.ActiveVacancyExistsForOrderAsync(command.OrderId, cancellationToken);
        if (activeVacancyExists)
            return new CreateVacancyResult { ErrorCode = CreateVacancyErrorCode.Conflict };

        var utcNow = DateTime.UtcNow;
        var vacancy = new Vacancy
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            ExecutorId = order.ExecutorId!.Value,
            Title = command.Title.Trim(),
            Description = command.Description.Trim(),
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        var createResult = await persistence.CreateAsync(vacancy, cancellationToken);
        if (createResult == CreateVacancyPersistenceResult.Conflict)
            return new CreateVacancyResult { ErrorCode = CreateVacancyErrorCode.Conflict };

        return new CreateVacancyResult
        {
            ErrorCode = CreateVacancyErrorCode.None,
            VacancyId = vacancy.Id,
            OrderId = vacancy.OrderId,
            CustomerId = vacancy.CustomerId,
            ExecutorId = vacancy.ExecutorId,
            Title = vacancy.Title,
            Description = vacancy.Description,
            CreatedAtUtc = vacancy.CreatedAtUtc,
            UpdatedAtUtc = vacancy.UpdatedAtUtc
        };
    }

    private static bool CanCreate(UserRole requesterRole, Guid requesterUserId, Guid? orderExecutorId)
    {
        return requesterRole == UserRole.Executor && orderExecutorId == requesterUserId;
    }
}
