namespace SelectProfi.backend.Contracts.Profile;

public sealed class ExecutorProfileResponse
{
    public ExecutorEmploymentType? EmploymentType { get; init; }

    public string? ProjectTitle { get; init; }

    public string? ProjectCompanyName { get; init; }

    public string? ExperienceSummary { get; init; }

    public string? Achievements { get; init; }

    public List<string>? Certificates { get; init; }

    public string? Grade { get; init; }

    public string? ExtraInfo { get; init; }
}
