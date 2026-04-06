using SelectProfi.backend.Domain.Candidates;

namespace SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;

public sealed class UpdateVacancyCandidateStageResult
{
    public UpdateVacancyCandidateStageErrorCode ErrorCode { get; init; } = UpdateVacancyCandidateStageErrorCode.None;

    public Guid VacancyCandidateId { get; init; }

    public Guid VacancyId { get; init; }

    public Guid CandidateId { get; init; }

    public VacancyCandidateStage Stage { get; init; } = VacancyCandidateStage.Pool;

    public DateTime AddedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
