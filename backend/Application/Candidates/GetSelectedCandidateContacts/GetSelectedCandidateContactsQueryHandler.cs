using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.GetSelectedCandidateContacts;

public sealed class GetSelectedCandidateContactsQueryHandler(IGetSelectedCandidateContactsPersistence persistence)
    : IQueryHandler<GetSelectedCandidateContactsQuery, GetSelectedCandidateContactsResult>
{
    public async Task<GetSelectedCandidateContactsResult> HandleAsync(
        GetSelectedCandidateContactsQuery query,
        CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveVacancyByIdAsync(query.VacancyId, cancellationToken);
        if (vacancy is null)
            return new GetSelectedCandidateContactsResult { ErrorCode = GetSelectedCandidateContactsErrorCode.VacancyNotFound };

        if (!CandidateAccessRules.CanReadSelectedCandidateContactsByCustomer(
                query.RequesterRole,
                query.RequesterUserId,
                vacancy.CustomerId))
            return new GetSelectedCandidateContactsResult { ErrorCode = GetSelectedCandidateContactsErrorCode.Forbidden };

        if (!vacancy.SelectedCandidateId.HasValue)
            return new GetSelectedCandidateContactsResult
                { ErrorCode = GetSelectedCandidateContactsErrorCode.CandidateNotSelected };

        var candidate = await persistence.FindActiveCandidateByIdAsync(vacancy.SelectedCandidateId.Value, cancellationToken);
        if (candidate is null)
            return new GetSelectedCandidateContactsResult { ErrorCode = GetSelectedCandidateContactsErrorCode.CandidateNotFound };

        return new GetSelectedCandidateContactsResult
        {
            ErrorCode = GetSelectedCandidateContactsErrorCode.None,
            VacancyId = vacancy.Id,
            CandidateId = candidate.Id,
            FullName = candidate.FullName,
            Email = candidate.Email,
            Phone = candidate.Phone
        };
    }
}
