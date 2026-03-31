using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Profile.GetMyProfile;

public sealed class GetMyProfileResult
{
    public GetMyProfileErrorCode ErrorCode { get; init; } = GetMyProfileErrorCode.None;

    public Guid UserId { get; init; }

    public string Email { get; init; } = string.Empty;

    public string? Phone { get; init; }

    public string FirstName { get; init; } = string.Empty;

    public string LastName { get; init; } = string.Empty;

    public string Role { get; init; } = string.Empty;

    public string ActiveRole { get; init; } = string.Empty;

    public IReadOnlyList<string> Roles { get; init; } = [];

    public bool IsEmailVerified { get; init; }

    public bool IsPhoneVerified { get; init; }

    public string? ApplicantResumeTitle { get; init; }

    public string? ApplicantPreviousCompanyName { get; init; }

    public string? ApplicantWorkPeriod { get; init; }

    public string? ApplicantExperienceSummary { get; init; }

    public string? ApplicantAchievements { get; init; }

    public string? ApplicantEducation { get; init; }

    public string? ApplicantSkills { get; init; }

    public string? ApplicantCertificates { get; init; }

    public string? ApplicantPortfolioUrl { get; init; }

    public string? ApplicantAbout { get; init; }

    public decimal? ApplicantDesiredSalary { get; init; }

    public string? CustomerInn { get; init; }

    public CustomerLegalForm? CustomerLegalForm { get; init; }

    public string? CustomerEgrn { get; init; }

    public string? CustomerEgrnip { get; init; }

    public string? CustomerCompanyName { get; init; }

    public string? CustomerCompanyLogoUrl { get; init; }

    public bool CustomerOfferAccepted { get; init; }

    public string? CustomerOfferVersion { get; init; }

    public DateTime? CustomerOfferAcceptedAtUtc { get; init; }

    public ExecutorEmploymentType? ExecutorEmploymentType { get; init; }

    public string? ExecutorProjectTitle { get; init; }

    public string? ExecutorProjectCompanyName { get; init; }

    public string? ExecutorExperienceSummary { get; init; }

    public string? ExecutorAchievements { get; init; }

    public string? ExecutorCertificates { get; init; }

    public string? ExecutorGrade { get; init; }

    public string? ExecutorExtraInfo { get; init; }
}
