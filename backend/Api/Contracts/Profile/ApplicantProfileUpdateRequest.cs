namespace SelectProfi.backend.Contracts.Profile;

public sealed class ApplicantProfileUpdateRequest
{
    public string? ResumeTitle { get; init; }

    public string? PreviousCompanyName { get; init; }

    public string? WorkPeriod { get; init; }

    public string? ExperienceSummary { get; init; }

    public string? Achievements { get; init; }

    public string? Education { get; init; }

    public List<string>? Skills { get; init; }

    public List<string>? Certificates { get; init; }

    public string? PortfolioUrl { get; init; }

    public string? About { get; init; }

    public decimal? DesiredSalary { get; init; }
}
