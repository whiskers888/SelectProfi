using System.Text.Json;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;
using SelectProfi.backend.Contracts.Profile;
using DomainExecutorEmploymentType = SelectProfi.backend.Domain.Users.ExecutorEmploymentType;

namespace SelectProfi.backend.Mappings;

public static class ProfileResponseMapper
{
    public static MyProfileResponse ToResponse(this GetMyProfileResult result)
    {
        return new MyProfileResponse
        {
            UserId = result.UserId,
            Email = result.Email,
            Phone = result.Phone,
            FirstName = result.FirstName,
            LastName = result.LastName,
            Role = result.Role,
            IsEmailVerified = result.IsEmailVerified,
            IsPhoneVerified = result.IsPhoneVerified,
            ApplicantProfile = BuildApplicantProfile(result),
            CustomerProfile = BuildCustomerProfile(result),
            ExecutorProfile = BuildExecutorProfile(result)
        };
    }

    public static MyProfileResponse ToResponse(this UpdateMyProfileResult result)
    {
        return new MyProfileResponse
        {
            UserId = result.UserId,
            Email = result.Email,
            Phone = result.Phone,
            FirstName = result.FirstName,
            LastName = result.LastName,
            Role = result.Role,
            IsEmailVerified = result.IsEmailVerified,
            IsPhoneVerified = result.IsPhoneVerified,
            ApplicantProfile = BuildApplicantProfile(result),
            CustomerProfile = BuildCustomerProfile(result),
            ExecutorProfile = BuildExecutorProfile(result)
        };
    }

    private static ApplicantProfileResponse? BuildApplicantProfile(GetMyProfileResult result)
    {
        return BuildApplicantProfile(
            result.ApplicantResumeTitle,
            result.ApplicantPreviousCompanyName,
            result.ApplicantWorkPeriod,
            result.ApplicantExperienceSummary,
            result.ApplicantAchievements,
            result.ApplicantEducation,
            result.ApplicantSkills,
            result.ApplicantCertificates,
            result.ApplicantPortfolioUrl,
            result.ApplicantAbout,
            result.ApplicantDesiredSalary);
    }

    private static ApplicantProfileResponse? BuildApplicantProfile(UpdateMyProfileResult result)
    {
        return BuildApplicantProfile(
            result.ApplicantResumeTitle,
            result.ApplicantPreviousCompanyName,
            result.ApplicantWorkPeriod,
            result.ApplicantExperienceSummary,
            result.ApplicantAchievements,
            result.ApplicantEducation,
            result.ApplicantSkills,
            result.ApplicantCertificates,
            result.ApplicantPortfolioUrl,
            result.ApplicantAbout,
            result.ApplicantDesiredSalary);
    }

    private static CustomerProfileResponse? BuildCustomerProfile(GetMyProfileResult result)
    {
        return BuildCustomerProfile(
            result.CustomerInn,
            result.CustomerEgrn,
            result.CustomerEgrnip,
            result.CustomerCompanyName,
            result.CustomerCompanyLogoUrl);
    }

    private static CustomerProfileResponse? BuildCustomerProfile(UpdateMyProfileResult result)
    {
        return BuildCustomerProfile(
            result.CustomerInn,
            result.CustomerEgrn,
            result.CustomerEgrnip,
            result.CustomerCompanyName,
            result.CustomerCompanyLogoUrl);
    }

    private static ExecutorProfileResponse? BuildExecutorProfile(GetMyProfileResult result)
    {
        return BuildExecutorProfile(
            result.ExecutorEmploymentType,
            result.ExecutorProjectTitle,
            result.ExecutorProjectCompanyName,
            result.ExecutorExperienceSummary,
            result.ExecutorAchievements,
            result.ExecutorCertificates,
            result.ExecutorGrade,
            result.ExecutorExtraInfo);
    }

    private static ExecutorProfileResponse? BuildExecutorProfile(UpdateMyProfileResult result)
    {
        return BuildExecutorProfile(
            result.ExecutorEmploymentType,
            result.ExecutorProjectTitle,
            result.ExecutorProjectCompanyName,
            result.ExecutorExperienceSummary,
            result.ExecutorAchievements,
            result.ExecutorCertificates,
            result.ExecutorGrade,
            result.ExecutorExtraInfo);
    }

    private static ApplicantProfileResponse? BuildApplicantProfile(
        string? resumeTitle,
        string? previousCompanyName,
        string? workPeriod,
        string? experienceSummary,
        string? achievements,
        string? education,
        string? skills,
        string? certificates,
        string? portfolioUrl,
        string? about,
        decimal? desiredSalary)
    {
        if (string.IsNullOrWhiteSpace(resumeTitle) &&
            string.IsNullOrWhiteSpace(previousCompanyName) &&
            string.IsNullOrWhiteSpace(workPeriod) &&
            string.IsNullOrWhiteSpace(experienceSummary) &&
            string.IsNullOrWhiteSpace(achievements) &&
            string.IsNullOrWhiteSpace(education) &&
            string.IsNullOrWhiteSpace(skills) &&
            string.IsNullOrWhiteSpace(certificates) &&
            string.IsNullOrWhiteSpace(portfolioUrl) &&
            string.IsNullOrWhiteSpace(about) &&
            desiredSalary is null)
            return null;

        return new ApplicantProfileResponse
        {
            ResumeTitle = resumeTitle,
            PreviousCompanyName = previousCompanyName,
            WorkPeriod = workPeriod,
            ExperienceSummary = experienceSummary,
            Achievements = achievements,
            Education = education,
            Skills = DeserializeStringList(skills),
            Certificates = DeserializeStringList(certificates),
            PortfolioUrl = portfolioUrl,
            About = about,
            DesiredSalary = desiredSalary
        };
    }

    private static CustomerProfileResponse? BuildCustomerProfile(
        string? inn,
        string? egrn,
        string? egrnip,
        string? companyName,
        string? companyLogoUrl)
    {
        if (string.IsNullOrWhiteSpace(inn) &&
            string.IsNullOrWhiteSpace(egrn) &&
            string.IsNullOrWhiteSpace(egrnip) &&
            string.IsNullOrWhiteSpace(companyName) &&
            string.IsNullOrWhiteSpace(companyLogoUrl))
            return null;

        return new CustomerProfileResponse
        {
            Inn = inn,
            Egrn = egrn,
            Egrnip = egrnip,
            CompanyName = companyName,
            CompanyLogoUrl = companyLogoUrl
        };
    }

    private static ExecutorProfileResponse? BuildExecutorProfile(
        DomainExecutorEmploymentType? employmentType,
        string? projectTitle,
        string? projectCompanyName,
        string? experienceSummary,
        string? achievements,
        string? certificates,
        string? grade,
        string? extraInfo)
    {
        if (employmentType is null &&
            string.IsNullOrWhiteSpace(projectTitle) &&
            string.IsNullOrWhiteSpace(projectCompanyName) &&
            string.IsNullOrWhiteSpace(experienceSummary) &&
            string.IsNullOrWhiteSpace(achievements) &&
            string.IsNullOrWhiteSpace(certificates) &&
            string.IsNullOrWhiteSpace(grade) &&
            string.IsNullOrWhiteSpace(extraInfo))
            return null;

        return new ExecutorProfileResponse
        {
            EmploymentType = MapExecutorEmploymentTypeToContract(employmentType),
            ProjectTitle = projectTitle,
            ProjectCompanyName = projectCompanyName,
            ExperienceSummary = experienceSummary,
            Achievements = achievements,
            Certificates = DeserializeStringList(certificates),
            Grade = grade,
            ExtraInfo = extraInfo
        };
    }

    private static List<string>? DeserializeStringList(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        try
        {
            var items = JsonSerializer.Deserialize<List<string>>(value);
            if (items is null || items.Count == 0)
                return null;

            return items;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static ExecutorEmploymentType? MapExecutorEmploymentTypeToContract(DomainExecutorEmploymentType? value)
    {
        return value switch
        {
            DomainExecutorEmploymentType.Fl => ExecutorEmploymentType.Fl,
            DomainExecutorEmploymentType.Smz => ExecutorEmploymentType.Smz,
            DomainExecutorEmploymentType.Ip => ExecutorEmploymentType.Ip,
            _ => null
        };
    }
}
