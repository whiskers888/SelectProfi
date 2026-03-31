using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Profile;

namespace SelectProfi.backend.Application.Profile.GetMyProfile;

public sealed class GetMyProfileQueryHandler(IProfileReadPersistence persistence)
    : IQueryHandler<GetMyProfileQuery, GetMyProfileResult>
{
    public async Task<GetMyProfileResult> HandleAsync(GetMyProfileQuery query, CancellationToken cancellationToken)
    {
        var user = await persistence.FindByIdAsync(query.UserId, cancellationToken);
        if (user is null)
            return new GetMyProfileResult { ErrorCode = GetMyProfileErrorCode.UserNotFound };

        var activeRole = user.Role.ToString();
        var roles = ProfileRoleSet.Resolve(user.Role);

        return new GetMyProfileResult
        {
            ErrorCode = GetMyProfileErrorCode.None,
            UserId = user.Id,
            Email = user.Email,
            Phone = user.Phone,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = activeRole,
            ActiveRole = activeRole,
            Roles = roles,
            IsEmailVerified = user.IsEmailVerified,
            IsPhoneVerified = user.IsPhoneVerified,
            ApplicantResumeTitle = user.ApplicantResumeTitle,
            ApplicantPreviousCompanyName = user.ApplicantPreviousCompanyName,
            ApplicantWorkPeriod = user.ApplicantWorkPeriod,
            ApplicantExperienceSummary = user.ApplicantExperienceSummary,
            ApplicantAchievements = user.ApplicantAchievements,
            ApplicantEducation = user.ApplicantEducation,
            ApplicantSkills = user.ApplicantSkills,
            ApplicantCertificates = user.ApplicantCertificates,
            ApplicantPortfolioUrl = user.ApplicantPortfolioUrl,
            ApplicantAbout = user.ApplicantAbout,
            ApplicantDesiredSalary = user.ApplicantDesiredSalary,
            CustomerInn = user.CustomerInn,
            CustomerLegalForm = user.CustomerLegalForm,
            CustomerEgrn = user.CustomerEgrn,
            CustomerEgrnip = user.CustomerEgrnip,
            CustomerCompanyName = user.CustomerCompanyName,
            CustomerCompanyLogoUrl = user.CustomerCompanyLogoUrl,
            CustomerOfferAccepted = user.CustomerOfferAccepted,
            CustomerOfferVersion = user.CustomerOfferVersion,
            CustomerOfferAcceptedAtUtc = user.CustomerOfferAcceptedAtUtc,
            ExecutorEmploymentType = user.ExecutorEmploymentType,
            ExecutorProjectTitle = user.ExecutorProjectTitle,
            ExecutorProjectCompanyName = user.ExecutorProjectCompanyName,
            ExecutorExperienceSummary = user.ExecutorExperienceSummary,
            ExecutorAchievements = user.ExecutorAchievements,
            ExecutorCertificates = user.ExecutorCertificates,
            ExecutorGrade = user.ExecutorGrade,
            ExecutorExtraInfo = user.ExecutorExtraInfo
        };
    }
}
