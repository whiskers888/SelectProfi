namespace SelectProfi.backend.Contracts.Candidates;

public sealed class MyCandidateResponse
{
    public Guid CandidateId { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string SpecializationName { get; init; } = string.Empty;
    public string ResumeTitle { get; init; } = string.Empty;
    public DateTime UpdatedAtUtc { get; init; }
}
