namespace SelectProfi.backend.Domain.Users;

public sealed class User
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string NormalizedEmail { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? NormalizedPhone { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public bool IsEmailVerified { get; set; }

    public bool IsPhoneVerified { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public string? ApplicantResumeTitle { get; set; }

    public string? ApplicantPreviousCompanyName { get; set; }

    public string? ApplicantWorkPeriod { get; set; }

    public string? ApplicantExperienceSummary { get; set; }

    public string? ApplicantAchievements { get; set; }

    public string? ApplicantEducation { get; set; }

    public string? ApplicantSkills { get; set; }

    public string? ApplicantCertificates { get; set; }

    public string? ApplicantPortfolioUrl { get; set; }

    public string? ApplicantAbout { get; set; }

    public decimal? ApplicantDesiredSalary { get; set; }

    public string? CustomerInn { get; set; }

    public CustomerLegalForm? CustomerLegalForm { get; set; }

    public string? CustomerEgrn { get; set; }

    public string? CustomerEgrnip { get; set; }

    public string? CustomerCompanyName { get; set; }

    public string? CustomerCompanyLogoUrl { get; set; }

    public bool CustomerOfferAccepted { get; set; }

    public string? CustomerOfferVersion { get; set; }

    public DateTime? CustomerOfferAcceptedAtUtc { get; set; }

    public ExecutorEmploymentType? ExecutorEmploymentType { get; set; }

    public string? ExecutorProjectTitle { get; set; }

    public string? ExecutorProjectCompanyName { get; set; }

    public string? ExecutorExperienceSummary { get; set; }

    public string? ExecutorAchievements { get; set; }

    public string? ExecutorCertificates { get; set; }

    public string? ExecutorGrade { get; set; }

    public string? ExecutorExtraInfo { get; set; }

    public ICollection<RefreshSession> RefreshSessions { get; set; } = new List<RefreshSession>();
}
