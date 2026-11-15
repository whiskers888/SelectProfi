using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Candidates;

namespace SelectProfi.backend.Application.Candidates.SubmitVacancyCandidateList;

public sealed class SubmitVacancyCandidateListCommandHandler(
    ISubmitVacancyCandidateListPersistence persistence)
    : ICommandHandler<SubmitVacancyCandidateListCommand, SubmitVacancyCandidateListResult>
{
    public async Task<SubmitVacancyCandidateListResult> HandleAsync(
        SubmitVacancyCandidateListCommand command,
        CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveVacancyByIdAsync(command.VacancyId, cancellationToken);
        if (vacancy is null)
            return new() { ErrorCode = SubmitVacancyCandidateListErrorCode.VacancyNotFound };

        if (!CandidateAccessRules.CanManageVacancyCandidateByExecutor(
                command.RequesterRole,
                command.RequesterUserId,
                vacancy.ExecutorId))
            return new() { ErrorCode = SubmitVacancyCandidateListErrorCode.Forbidden };

        if (!CandidateAccessRules.CanMutateVacancyCandidatePipeline(vacancy.Status))
            return new() { ErrorCode = SubmitVacancyCandidateListErrorCode.VacancyNotPublished };

        if (vacancy.ShortlistSentToCustomerAtUtc is not null)
            return new() { ErrorCode = SubmitVacancyCandidateListErrorCode.AlreadySubmitted };

        var shortlist = await persistence.FindActiveShortlistCandidatesAsync(command.VacancyId, cancellationToken);
        if (shortlist.Count < vacancy.Order.RequestedCandidatesCount)
            return new() { ErrorCode = SubmitVacancyCandidateListErrorCode.ShortlistIncomplete };

        var submittedAtUtc = DateTime.UtcNow;
        foreach (var candidate in shortlist)
        {
            candidate.CustomerSubmittedAtUtc = submittedAtUtc;
            candidate.UpdatedAtUtc = submittedAtUtc;
        }

        vacancy.ShortlistSentToCustomerAtUtc = submittedAtUtc;
        vacancy.CandidatePipelineRevision++;
        vacancy.UpdatedAtUtc = submittedAtUtc;

        var saveResult = await persistence.SaveChangesAsync(cancellationToken);
        if (saveResult == SubmitVacancyCandidateListPersistenceResult.Conflict)
            return new() { ErrorCode = SubmitVacancyCandidateListErrorCode.Conflict };

        return new()
        {
            VacancyId = vacancy.Id,
            SubmittedAtUtc = submittedAtUtc,
            SubmittedCandidatesCount = shortlist.Count
        };
    }
}
