using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Vacancies.GetVacancies;

public sealed class GetVacanciesQueryHandler(IGetVacanciesPersistence persistence)
    : IQueryHandler<GetVacanciesQuery, GetVacanciesResult>
{
    public async Task<GetVacanciesResult> HandleAsync(GetVacanciesQuery query, CancellationToken cancellationToken)
    {
        if (!CanReadVacancies(query.RequesterRole))
            return new GetVacanciesResult { ErrorCode = GetVacanciesErrorCode.Forbidden };

        var vacancies = await persistence.FindVisibleActiveVacanciesAsync(
            query.RequesterUserId,
            query.RequesterRole,
            query.Limit,
            query.Offset,
            cancellationToken);

        var items = vacancies.Select(vacancy => new GetVacanciesItemResult
        {
            VacancyId = vacancy.Id,
            OrderId = vacancy.OrderId,
            CustomerId = vacancy.CustomerId,
            ExecutorId = vacancy.ExecutorId,
            Title = vacancy.Title,
            Description = vacancy.Description,
            CreatedAtUtc = vacancy.CreatedAtUtc,
            UpdatedAtUtc = vacancy.UpdatedAtUtc
        }).ToArray();

        return new GetVacanciesResult
        {
            ErrorCode = GetVacanciesErrorCode.None,
            Items = items,
            Limit = query.Limit,
            Offset = query.Offset
        };
    }

    private static bool CanReadVacancies(UserRole requesterRole)
    {
        return requesterRole is UserRole.Admin or UserRole.Customer or UserRole.Executor;
    }
}
