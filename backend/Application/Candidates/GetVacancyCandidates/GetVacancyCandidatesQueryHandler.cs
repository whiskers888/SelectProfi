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
}
