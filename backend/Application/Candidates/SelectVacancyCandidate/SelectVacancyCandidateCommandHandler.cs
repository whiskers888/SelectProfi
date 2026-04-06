using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;

public sealed class SelectVacancyCandidateCommandHandler(ISelectVacancyCandidatePersistence persistence)
    : ICommandHandler<SelectVacancyCandidateCommand, SelectVacancyCandidateResult>
{
    public async Task<SelectVacancyCandidateResult> HandleAsync(
        SelectVacancyCandidateCommand command,
        CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveVacancyByIdAsync(command.VacancyId, cancellationToken);
        if (vacancy is null)
            return new SelectVacancyCandidateResult { ErrorCode = SelectVacancyCandidateErrorCode.VacancyNotFound };

        if (!CandidateAccessRules.CanSelectVacancyCandidateByCustomer(
                command.RequesterRole,
                command.RequesterUserId,
                vacancy.CustomerId))
            return new SelectVacancyCandidateResult { ErrorCode = SelectVacancyCandidateErrorCode.Forbidden };

        if (!CandidateAccessRules.CanMutateVacancyCandidatePipeline(vacancy.Status))
            return new SelectVacancyCandidateResult { ErrorCode = SelectVacancyCandidateErrorCode.VacancyNotPublished };

        if (vacancy.SelectedCandidateId.HasValue && vacancy.SelectedCandidateId.Value != command.CandidateId)
            return new SelectVacancyCandidateResult { ErrorCode = SelectVacancyCandidateErrorCode.Conflict };

        if (vacancy.SelectedCandidateId != command.CandidateId)
        {
            var inShortlist = await persistence.CandidateInShortlistAsync(
                command.VacancyId,
                command.CandidateId,
                cancellationToken);
            if (!inShortlist)
                return new SelectVacancyCandidateResult
                {
                    ErrorCode = SelectVacancyCandidateErrorCode.CandidateNotInShortlist
                };

            vacancy.SelectedCandidateId = command.CandidateId;
            vacancy.UpdatedAtUtc = DateTime.UtcNow;

            var saveResult = await persistence.SaveChangesAsync(cancellationToken);
            if (saveResult == SelectVacancyCandidatePersistenceResult.Conflict)
                return new SelectVacancyCandidateResult { ErrorCode = SelectVacancyCandidateErrorCode.Conflict };
        }

        return new SelectVacancyCandidateResult
        {
            ErrorCode = SelectVacancyCandidateErrorCode.None,
            VacancyId = vacancy.Id,
            SelectedCandidateId = vacancy.SelectedCandidateId!.Value,
            UpdatedAtUtc = vacancy.UpdatedAtUtc
        };
    }
}
