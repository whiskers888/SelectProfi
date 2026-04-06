using SelectProfi.backend.Domain.Candidates;

namespace SelectProfi.backend.Application.Candidates.AddCandidateFromBase;

public sealed class AddCandidateFromBaseResult
{
    public AddCandidateFromBaseErrorCode ErrorCode { get; init; } = AddCandidateFromBaseErrorCode.None;

    public Guid VacancyCandidateId { get; init; }

    public Guid VacancyId { get; init; }

    public Guid CandidateId { get; init; }

    public VacancyCandidateStage Stage { get; init; } = VacancyCandidateStage.Pool;

    public DateTime AddedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
