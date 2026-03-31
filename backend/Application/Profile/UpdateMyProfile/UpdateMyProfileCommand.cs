using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Profile.UpdateMyProfile;

public sealed class UpdateMyProfileCommand : ICommand<UpdateMyProfileResult>
{
    public Guid UserId { get; init; }

    public string FirstName { get; init; } = string.Empty;

    public string LastName { get; init; } = string.Empty;

    public string? Phone { get; init; }

    public ApplicantProfileUpdatePayload? ApplicantProfile { get; init; }

    public CustomerProfileUpdatePayload? CustomerProfile { get; init; }

    public ExecutorProfileUpdatePayload? ExecutorProfile { get; init; }
}

public sealed class ApplicantProfileUpdatePayload
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

public sealed class CustomerProfileUpdatePayload
{
    public string? Inn { get; init; }

    public CustomerLegalForm? LegalForm { get; init; }

    public string? Egrn { get; init; }

    public string? Egrnip { get; init; }

    public string? CompanyName { get; init; }

    public string? CompanyLogoUrl { get; init; }

    public bool? OfferAccepted { get; init; }

    public string? OfferVersion { get; init; }
}

public sealed class ExecutorProfileUpdatePayload
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
