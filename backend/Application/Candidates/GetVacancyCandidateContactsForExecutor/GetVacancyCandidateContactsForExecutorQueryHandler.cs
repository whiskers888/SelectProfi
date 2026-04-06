using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;

public sealed class GetVacancyCandidateContactsForExecutorQueryHandler(
    IGetVacancyCandidateContactsForExecutorPersistence persistence)
    : IQueryHandler<GetVacancyCandidateContactsForExecutorQuery, GetVacancyCandidateContactsForExecutorResult>
{
    public async Task<GetVacancyCandidateContactsForExecutorResult> HandleAsync(
        GetVacancyCandidateContactsForExecutorQuery query,
        CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveVacancyByIdAsync(query.VacancyId, cancellationToken);
        if (vacancy is null)
        {
            return new GetVacancyCandidateContactsForExecutorResult
            {
                ErrorCode = GetVacancyCandidateContactsForExecutorErrorCode.VacancyNotFound
            };
        }

        if (!CandidateAccessRules.CanManageVacancyCandidateByExecutor(
                query.RequesterRole,
                query.RequesterUserId,
                vacancy.ExecutorId))
        {
            return new GetVacancyCandidateContactsForExecutorResult
            {
                ErrorCode = GetVacancyCandidateContactsForExecutorErrorCode.Forbidden
            };
        }

        var vacancyCandidate = await persistence.FindActiveVacancyCandidateAsync(
            query.VacancyId,
            query.CandidateId,
            cancellationToken);
        if (vacancyCandidate is null)
        {
            return new GetVacancyCandidateContactsForExecutorResult
            {
                ErrorCode = GetVacancyCandidateContactsForExecutorErrorCode.CandidateLinkNotFound
            };
        }

        var candidate = vacancyCandidate.Candidate;
        var contactsAccessExpiresAtUtc = candidate.ContactsAccessExpiresAtUtc;
        if (!contactsAccessExpiresAtUtc.HasValue)
        {
            return new GetVacancyCandidateContactsForExecutorResult
            {
                ErrorCode = GetVacancyCandidateContactsForExecutorErrorCode.ContactsAccessDenied
            };
        }

        var hasContactsAccess = candidate.ContactsOwnerExecutorId == query.RequesterUserId
                                && contactsAccessExpiresAtUtc.Value > DateTime.UtcNow;
        if (!hasContactsAccess)
        {
            return new GetVacancyCandidateContactsForExecutorResult
            {
                ErrorCode = GetVacancyCandidateContactsForExecutorErrorCode.ContactsAccessDenied
            };
        }

        return new GetVacancyCandidateContactsForExecutorResult
        {
            ErrorCode = GetVacancyCandidateContactsForExecutorErrorCode.None,
            VacancyId = vacancy.Id,
            CandidateId = candidate.Id,
            FullName = candidate.FullName,
            Email = candidate.Email,
            Phone = candidate.Phone,
            ContactsAccessExpiresAtUtc = contactsAccessExpiresAtUtc.Value
        };
    }
}
