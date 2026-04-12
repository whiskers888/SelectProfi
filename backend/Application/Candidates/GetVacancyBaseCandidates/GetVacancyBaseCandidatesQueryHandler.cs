using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Candidates.GetVacancyBaseCandidates;

public sealed class GetVacancyBaseCandidatesQueryHandler(IGetVacancyBaseCandidatesPersistence persistence)
    : IQueryHandler<GetVacancyBaseCandidatesQuery, GetVacancyBaseCandidatesResult>
{
    public async Task<GetVacancyBaseCandidatesResult> HandleAsync(
        GetVacancyBaseCandidatesQuery query,
        CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveVacancyByIdAsync(query.VacancyId, cancellationToken);
        if (vacancy is null)
        {
            return new GetVacancyBaseCandidatesResult
            {
                ErrorCode = GetVacancyBaseCandidatesErrorCode.VacancyNotFound
            };
        }

        if (!CandidateAccessRules.CanManageVacancyCandidateByExecutor(
                query.RequesterRole,
                query.RequesterUserId,
                vacancy.ExecutorId))
        {
            return new GetVacancyBaseCandidatesResult
            {
                ErrorCode = GetVacancyBaseCandidatesErrorCode.Forbidden
            };
        }

        if (!CandidateAccessRules.CanMutateVacancyCandidatePipeline(vacancy.Status))
        {
            return new GetVacancyBaseCandidatesResult
            {
                ErrorCode = GetVacancyBaseCandidatesErrorCode.VacancyNotPublished
            };
        }

        var candidates = await persistence.FindGlobalBaseCandidatesAsync(cancellationToken);
        var items = candidates
            .Select(candidate => new GetVacancyBaseCandidatesItemResult
            {
                CandidateId = candidate.Id,
                PublicAlias = candidate.PublicAlias,
                DisplayName = ResolveDisplayName(candidate, query.RequesterUserId),
                Source = candidate.Source,
                IsOwnedByRequester = IsOwnedByRequester(candidate, query.RequesterUserId),
                IsAnonymized = IsAnonymized(candidate, query.RequesterUserId),
                UpdatedAtUtc = candidate.UpdatedAtUtc
            })
            .ToArray();

        return new GetVacancyBaseCandidatesResult
        {
            ErrorCode = GetVacancyBaseCandidatesErrorCode.None,
            VacancyId = vacancy.Id,
            Items = items
        };
    }

    private static bool IsOwnedByRequester(Domain.Candidates.Candidate candidate, Guid requesterUserId)
    {
        return candidate.CreatedByExecutorId == requesterUserId
               || candidate.ContactsOwnerExecutorId == requesterUserId;
    }

    private static bool IsAnonymized(Domain.Candidates.Candidate candidate, Guid requesterUserId)
    {
        if (candidate.Source == Domain.Candidates.CandidateSource.RegisteredUser)
        {
            return false;
        }

        return !IsOwnedByRequester(candidate, requesterUserId);
    }

    private static string ResolveDisplayName(Domain.Candidates.Candidate candidate, Guid requesterUserId)
    {
        return IsAnonymized(candidate, requesterUserId) ? candidate.PublicAlias : candidate.FullName;
    }
}
