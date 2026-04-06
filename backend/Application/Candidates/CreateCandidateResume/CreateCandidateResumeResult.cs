namespace SelectProfi.backend.Application.Candidates.CreateCandidateResume;

public sealed class CreateCandidateResumeResult
{
    public CreateCandidateResumeErrorCode ErrorCode { get; init; } = CreateCandidateResumeErrorCode.None;

    public Guid CandidateId { get; init; }

    public Guid CandidateResumeId { get; init; }

    public Guid VacancyCandidateId { get; init; }

    public string PublicAlias { get; init; } = string.Empty;

    public DateTime ContactsAccessExpiresAtUtc { get; init; }
}
