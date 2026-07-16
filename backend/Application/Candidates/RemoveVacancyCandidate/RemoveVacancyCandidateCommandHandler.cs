using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Candidates.RemoveVacancyCandidate;

public sealed class RemoveVacancyCandidateCommandHandler(IRemoveVacancyCandidatePersistence persistence)
    : ICommandHandler<RemoveVacancyCandidateCommand, RemoveVacancyCandidateResult>
{
    public async Task<RemoveVacancyCandidateResult> HandleAsync(RemoveVacancyCandidateCommand command, CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveVacancyByIdAsync(command.VacancyId, cancellationToken);
        if (vacancy is null) return new() { ErrorCode = RemoveVacancyCandidateErrorCode.VacancyNotFound };
        if (!CandidateAccessRules.CanManageVacancyCandidateByExecutor(command.RequesterRole, command.RequesterUserId, vacancy.ExecutorId))
            return new() { ErrorCode = RemoveVacancyCandidateErrorCode.Forbidden };
        if (!CandidateAccessRules.CanMutateVacancyCandidatePipeline(vacancy.Status))
            return new() { ErrorCode = RemoveVacancyCandidateErrorCode.VacancyNotPublished };

        var link = await persistence.FindActiveLinkAsync(command.VacancyId, command.CandidateId, cancellationToken);
        if (link is null) return new() { ErrorCode = RemoveVacancyCandidateErrorCode.CandidateLinkNotFound };

        var now = DateTime.UtcNow;
        link.DeletedAtUtc = now;
        link.UpdatedAtUtc = now;
        if (vacancy.SelectedCandidateId == command.CandidateId)
        {
            vacancy.SelectedCandidateId = null;
            vacancy.UpdatedAtUtc = now;
        }
        await persistence.SaveChangesAsync(cancellationToken);
        return new();
    }
}
