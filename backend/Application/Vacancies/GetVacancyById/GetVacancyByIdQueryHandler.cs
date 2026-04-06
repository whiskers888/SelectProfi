using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Vacancies.GetVacancyById;

public sealed class GetVacancyByIdQueryHandler(IGetVacancyByIdPersistence persistence)
    : IQueryHandler<GetVacancyByIdQuery, GetVacancyByIdResult>
{
    public async Task<GetVacancyByIdResult> HandleAsync(GetVacancyByIdQuery query, CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveByIdAsync(query.VacancyId, cancellationToken);
        if (vacancy is null)
            return new GetVacancyByIdResult { ErrorCode = GetVacancyByIdErrorCode.NotFound };

        if (!VacancyAccessRules.CanReadVacancy(
                query.RequesterRole,
                query.RequesterUserId,
                vacancy.CustomerId,
                vacancy.ExecutorId,
                vacancy.Status))
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
            Status = vacancy.Status,
            CreatedAtUtc = vacancy.CreatedAtUtc,
            UpdatedAtUtc = vacancy.UpdatedAtUtc
        };
    }
}
