using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Vacancies.GetVacancies;

public sealed class GetVacanciesQueryHandler(IGetVacanciesPersistence persistence)
    : IQueryHandler<GetVacanciesQuery, GetVacanciesResult>
{
    public async Task<GetVacanciesResult> HandleAsync(GetVacanciesQuery query, CancellationToken cancellationToken)
    {
        if (!VacancyAccessRules.CanReadVacancies(query.RequesterRole))
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
            Status = vacancy.Status,
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
}
