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

        var candidates = await persistence.FindAvailableBaseCandidatesAsync(query.VacancyId, cancellationToken);
        var items = candidates
            .Select(candidate => new GetVacancyBaseCandidatesItemResult
            {
                CandidateId = candidate.Id,
                PublicAlias = candidate.PublicAlias,
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
}
