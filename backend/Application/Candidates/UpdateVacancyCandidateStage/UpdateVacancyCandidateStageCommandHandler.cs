using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;

public sealed class UpdateVacancyCandidateStageCommandHandler(IUpdateVacancyCandidateStagePersistence persistence)
    : ICommandHandler<UpdateVacancyCandidateStageCommand, UpdateVacancyCandidateStageResult>
{
    public async Task<UpdateVacancyCandidateStageResult> HandleAsync(
        UpdateVacancyCandidateStageCommand command,
        CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveVacancyByIdAsync(command.VacancyId, cancellationToken);
        if (vacancy is null)
            return new UpdateVacancyCandidateStageResult
            {
                ErrorCode = UpdateVacancyCandidateStageErrorCode.VacancyNotFound
            };

        if (!CandidateAccessRules.CanManageVacancyCandidateByExecutor(
                command.RequesterRole,
                command.RequesterUserId,
                vacancy.ExecutorId))
            return new UpdateVacancyCandidateStageResult { ErrorCode = UpdateVacancyCandidateStageErrorCode.Forbidden };

        if (!CandidateAccessRules.CanMutateVacancyCandidatePipeline(vacancy.Status))
            return new UpdateVacancyCandidateStageResult { ErrorCode = UpdateVacancyCandidateStageErrorCode.VacancyNotPublished };

        var targetStage = command.Stage;
        if (!Enum.IsDefined(targetStage))
            return new UpdateVacancyCandidateStageResult { ErrorCode = UpdateVacancyCandidateStageErrorCode.InvalidStage };

        var vacancyCandidate = await persistence.FindActiveVacancyCandidateAsync(
            command.VacancyId,
            command.CandidateId,
            cancellationToken);
        if (vacancyCandidate is null)
            return new UpdateVacancyCandidateStageResult
            {
                ErrorCode = UpdateVacancyCandidateStageErrorCode.CandidateLinkNotFound
            };

        if (vacancy.SelectedCandidateId == vacancyCandidate.CandidateId && targetStage != VacancyCandidateStage.Shortlist)
            return new UpdateVacancyCandidateStageResult { ErrorCode = UpdateVacancyCandidateStageErrorCode.Conflict };

        var shouldSaveVacancy = false;
        var previousStage = vacancyCandidate.Stage;
        if (vacancyCandidate.Stage != targetStage)
        {
            vacancyCandidate.Stage = targetStage;
            vacancyCandidate.UpdatedAtUtc = DateTime.UtcNow;
            shouldSaveVacancy = true;
        }

        // @dvnull: Ранее shortlist не имел серверной фиксации факта авто-отправки заказчику; добавлена отметка при достижении порога заказа.
        if (targetStage == VacancyCandidateStage.Shortlist && vacancy.ShortlistSentToCustomerAtUtc is null)
        {
            var shortlistCandidatesCount = await persistence.CountShortlistCandidatesAsync(command.VacancyId, cancellationToken);
            if (previousStage != VacancyCandidateStage.Shortlist && targetStage == VacancyCandidateStage.Shortlist)
                shortlistCandidatesCount += 1;
            if (shortlistCandidatesCount >= vacancy.Order.RequestedCandidatesCount)
            {
                vacancy.ShortlistSentToCustomerAtUtc = DateTime.UtcNow;
                vacancy.UpdatedAtUtc = DateTime.UtcNow;
                shouldSaveVacancy = true;
            }
        }

        if (shouldSaveVacancy)
        {
            var saveResult = await persistence.SaveChangesAsync(cancellationToken);
            if (saveResult == UpdateVacancyCandidateStagePersistenceResult.Conflict)
                return new UpdateVacancyCandidateStageResult { ErrorCode = UpdateVacancyCandidateStageErrorCode.Conflict };
        }

        return new UpdateVacancyCandidateStageResult
        {
            ErrorCode = UpdateVacancyCandidateStageErrorCode.None,
            VacancyCandidateId = vacancyCandidate.Id,
            VacancyId = vacancyCandidate.VacancyId,
            CandidateId = vacancyCandidate.CandidateId,
            Stage = vacancyCandidate.Stage,
            AddedAtUtc = vacancyCandidate.AddedAtUtc,
            UpdatedAtUtc = vacancyCandidate.UpdatedAtUtc
        };
    }
}
