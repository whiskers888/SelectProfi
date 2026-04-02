using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Vacancies.GetVacancyById;

public sealed class GetVacancyByIdQueryHandler(IGetVacancyByIdPersistence persistence)
    : IQueryHandler<GetVacancyByIdQuery, GetVacancyByIdResult>
{
    public async Task<GetVacancyByIdResult> HandleAsync(GetVacancyByIdQuery query, CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveByIdAsync(query.VacancyId, cancellationToken);
        if (vacancy is null)
            return new GetVacancyByIdResult { ErrorCode = GetVacancyByIdErrorCode.NotFound };

        if (!CanRead(query.RequesterRole, query.RequesterUserId, vacancy.CustomerId, vacancy.ExecutorId))
            return new GetVacancyByIdResult { ErrorCode = GetVacancyByIdErrorCode.Forbidden };

        return new GetVacancyByIdResult
        {
            ErrorCode = GetVacancyByIdErrorCode.None,
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

    private static bool CanRead(UserRole requesterRole, Guid requesterUserId, Guid customerId, Guid executorId)
    {
        return requesterRole switch
        {
            UserRole.Admin => true,
            UserRole.Customer => requesterUserId == customerId,
            UserRole.Executor => requesterUserId == executorId,
            _ => false
        };
    }
}
