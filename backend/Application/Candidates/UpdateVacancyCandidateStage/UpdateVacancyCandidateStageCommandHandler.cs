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

        if (vacancyCandidate.Stage != targetStage)
        {
            vacancyCandidate.Stage = targetStage;
            vacancyCandidate.UpdatedAtUtc = DateTime.UtcNow;

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
