namespace SelectProfi.backend.Application.Candidates.GetMyCandidates;

public sealed class GetMyCandidatesResult
{
    public IReadOnlyList<GetMyCandidatesItemResult> Items { get; init; } = [];
}

public sealed class GetMyCandidatesItemResult
{
    public Guid CandidateId { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string SpecializationName { get; init; } = string.Empty;
    public string ResumeTitle { get; init; } = string.Empty;
    public int? ExperienceYears { get; init; }
    public DateTime UpdatedAtUtc { get; init; }
}
