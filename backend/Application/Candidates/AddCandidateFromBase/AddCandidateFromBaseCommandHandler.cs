using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.AddCandidateFromBase;

public sealed class AddCandidateFromBaseCommandHandler(IAddCandidateFromBasePersistence persistence)
    : ICommandHandler<AddCandidateFromBaseCommand, AddCandidateFromBaseResult>
{
    public async Task<AddCandidateFromBaseResult> HandleAsync(
        AddCandidateFromBaseCommand command,
        CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveVacancyByIdAsync(command.VacancyId, cancellationToken);
        if (vacancy is null)
            return new AddCandidateFromBaseResult { ErrorCode = AddCandidateFromBaseErrorCode.VacancyNotFound };

        if (!CandidateAccessRules.CanManageVacancyCandidateByExecutor(command.RequesterRole, command.RequesterUserId, vacancy.ExecutorId))
            return new AddCandidateFromBaseResult { ErrorCode = AddCandidateFromBaseErrorCode.Forbidden };

        if (!CandidateAccessRules.CanMutateVacancyCandidatePipeline(vacancy.Status))
            return new AddCandidateFromBaseResult { ErrorCode = AddCandidateFromBaseErrorCode.VacancyNotPublished };

        var candidate = await persistence.FindRegisteredCandidateByIdAsync(command.CandidateId, cancellationToken);
        if (candidate is null)
            return new AddCandidateFromBaseResult { ErrorCode = AddCandidateFromBaseErrorCode.CandidateNotFound };

        var utcNow = DateTime.UtcNow;
        var vacancyCandidate = new VacancyCandidate
        {
            Id = Guid.NewGuid(),
            VacancyId = vacancy.Id,
            CandidateId = candidate.Id,
            AddedByExecutorId = command.RequesterUserId,
            Stage = VacancyCandidateStage.Pool,
            AddedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        var createResult = await persistence.CreateAsync(vacancyCandidate, cancellationToken);
        if (createResult == AddCandidateFromBasePersistenceResult.Conflict)
            return new AddCandidateFromBaseResult { ErrorCode = AddCandidateFromBaseErrorCode.Conflict };

        return new AddCandidateFromBaseResult
        {
            ErrorCode = AddCandidateFromBaseErrorCode.None,
            VacancyCandidateId = vacancyCandidate.Id,
            VacancyId = vacancyCandidate.VacancyId,
            CandidateId = vacancyCandidate.CandidateId,
            Stage = vacancyCandidate.Stage,
            AddedAtUtc = vacancyCandidate.AddedAtUtc,
            UpdatedAtUtc = vacancyCandidate.UpdatedAtUtc
        };
    }
}
