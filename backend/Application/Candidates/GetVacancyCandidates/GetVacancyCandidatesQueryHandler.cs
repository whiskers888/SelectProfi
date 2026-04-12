using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Candidates.GetVacancyCandidates;

public sealed class GetVacancyCandidatesQueryHandler(IGetVacancyCandidatesPersistence persistence)
    : IQueryHandler<GetVacancyCandidatesQuery, GetVacancyCandidatesResult>
{
    public async Task<GetVacancyCandidatesResult> HandleAsync(
        GetVacancyCandidatesQuery query,
        CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveVacancyByIdAsync(query.VacancyId, cancellationToken);
        if (vacancy is null)
        {
            return new GetVacancyCandidatesResult
            {
                ErrorCode = GetVacancyCandidatesErrorCode.VacancyNotFound
            };
        }

        if (!CandidateAccessRules.CanReadVacancyCandidates(
                query.RequesterRole,
                query.RequesterUserId,
                vacancy.CustomerId,
                vacancy.ExecutorId))
        {
            return new GetVacancyCandidatesResult
            {
                ErrorCode = GetVacancyCandidatesErrorCode.Forbidden
            };
        }

        var vacancyCandidates = await persistence.FindActiveVacancyCandidatesAsync(query.VacancyId, cancellationToken);
        var selectedCandidateId = vacancy.SelectedCandidateId;
        var items = vacancyCandidates
            .Select(vacancyCandidate => new GetVacancyCandidatesItemResult
            {
                VacancyCandidateId = vacancyCandidate.Id,
                CandidateId = vacancyCandidate.CandidateId,
                PublicAlias = vacancyCandidate.Candidate.PublicAlias,
                DisplayName = ResolveDisplayName(vacancyCandidate.Candidate, query.RequesterUserId),
                Source = vacancyCandidate.Candidate.Source,
                IsOwnedByRequester = IsOwnedByRequester(vacancyCandidate.Candidate, query.RequesterUserId),
                IsAnonymized = IsAnonymized(vacancyCandidate.Candidate, query.RequesterUserId),
                Stage = vacancyCandidate.Stage,
                AddedAtUtc = vacancyCandidate.AddedAtUtc,
                UpdatedAtUtc = vacancyCandidate.UpdatedAtUtc,
                ViewedByCustomerAtUtc = vacancyCandidate.ViewedByCustomerAtUtc,
                IsSelected = selectedCandidateId == vacancyCandidate.CandidateId
            })
            .ToArray();

        return new GetVacancyCandidatesResult
        {
            ErrorCode = GetVacancyCandidatesErrorCode.None,
            VacancyId = vacancy.Id,
            SelectedCandidateId = selectedCandidateId,
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
