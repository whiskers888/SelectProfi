using System.Text.Json;
using System.Text.RegularExpressions;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Profile.UpdateMyProfile;

public sealed class UpdateMyProfileCommandHandler(IProfileWritePersistence persistence)
    : ICommandHandler<UpdateMyProfileCommand, UpdateMyProfileResult>
{
    private const int ApplicantResumeTitleMaxLength = 200;
    private const int ApplicantPreviousCompanyNameMaxLength = 200;
    private const int ApplicantWorkPeriodMaxLength = 100;
    private const int ApplicantExperienceSummaryMaxLength = 2000;
    private const int ApplicantAchievementsMaxLength = 2000;
    private const int ApplicantEducationMaxLength = 1000;
    private const int ApplicantPortfolioUrlMaxLength = 512;
    private const int ApplicantAboutMaxLength = 2000;
    private const int ApplicantListSerializedMaxLength = 4000;

    private const int CustomerInnMaxLength = 12;
    private const int CustomerEgrnMaxLength = 13;
    private const int CustomerEgrnipMaxLength = 15;
    private const int CustomerCompanyNameMaxLength = 255;
    private const int CustomerCompanyLogoUrlMaxLength = 512;

    private const int ExecutorProjectTitleMaxLength = 200;
    private const int ExecutorProjectCompanyNameMaxLength = 200;
    private const int ExecutorExperienceSummaryMaxLength = 2000;
    private const int ExecutorAchievementsMaxLength = 2000;
    private const int ExecutorGradeMaxLength = 50;
    private const int ExecutorExtraInfoMaxLength = 2000;
    private const int ExecutorCertificatesSerializedMaxLength = 4000;

    private const int ListItemMaxLength = 256;
    private static readonly Regex InnRegex = new(@"^\d{10}(\d{2})?$", RegexOptions.Compiled);
    private static readonly Regex EgrnRegex = new(@"^\d{13}$", RegexOptions.Compiled);
    private static readonly Regex EgrnipRegex = new(@"^\d{15}$", RegexOptions.Compiled);
    private static readonly decimal MaxDesiredSalary = 9_999_999_999_999_999.99m;

    public async Task<UpdateMyProfileResult> HandleAsync(UpdateMyProfileCommand command, CancellationToken cancellationToken)
    {
        var user = await persistence.FindByIdAsync(command.UserId, cancellationToken);
        if (user is null)
            return new UpdateMyProfileResult { ErrorCode = UpdateMyProfileErrorCode.UserNotFound };

        var normalizedPhone = NormalizePhone(command.Phone);
        if (normalizedPhone is not null &&
            !string.Equals(normalizedPhone, user.NormalizedPhone, StringComparison.Ordinal) &&
            await persistence.PhoneExistsForAnotherUserAsync(normalizedPhone, command.UserId, cancellationToken))
            return new UpdateMyProfileResult { ErrorCode = UpdateMyProfileErrorCode.PhoneAlreadyExists };

        if (!TryApplyRoleSpecificProfile(command, user))
            return new UpdateMyProfileResult { ErrorCode = UpdateMyProfileErrorCode.InvalidRoleSpecificPayload };

        user.FirstName = command.FirstName.Trim();
        user.LastName = command.LastName.Trim();
        user.Phone = normalizedPhone;
        user.NormalizedPhone = normalizedPhone;

        var saveResult = await persistence.SaveChangesAsync(cancellationToken);
        if (saveResult == ProfileWritePersistenceResult.Conflict)
            return new UpdateMyProfileResult { ErrorCode = UpdateMyProfileErrorCode.PhoneAlreadyExists };

        return new UpdateMyProfileResult
        {
            ErrorCode = UpdateMyProfileErrorCode.None,
            UserId = user.Id,
            Email = user.Email,
            Phone = user.Phone,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role.ToString(),
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
            CustomerEgrn = user.CustomerEgrn,
            CustomerEgrnip = user.CustomerEgrnip,
            CustomerCompanyName = user.CustomerCompanyName,
            CustomerCompanyLogoUrl = user.CustomerCompanyLogoUrl,
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

    private static string? NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return null;

        return phone.Trim();
    }

    private static bool TryApplyRoleSpecificProfile(UpdateMyProfileCommand command, User user)
    {
        var hasApplicantPayload = command.ApplicantProfile is not null;
        var hasCustomerPayload = command.CustomerProfile is not null;
        var hasExecutorPayload = command.ExecutorProfile is not null;

        switch (user.Role)
        {
            case UserRole.Applicant:
                if (hasCustomerPayload || hasExecutorPayload)
                    return false;

                if (!IsValidApplicantPayload(command.ApplicantProfile))
                    return false;

                ApplyApplicantProfile(command.ApplicantProfile, user);
                return true;

            case UserRole.Customer:
                if (hasApplicantPayload || hasExecutorPayload)
                    return false;

                if (!IsValidCustomerPayload(command.CustomerProfile))
                    return false;

                ApplyCustomerProfile(command.CustomerProfile, user);
                return true;

            case UserRole.Executor:
                if (hasApplicantPayload || hasCustomerPayload)
                    return false;

                if (command.ExecutorProfile is not null && command.ExecutorProfile.EmploymentType is null)
                    return false;

                if (!IsValidExecutorPayload(command.ExecutorProfile))
                    return false;

                ApplyExecutorProfile(command.ExecutorProfile, user);
                return true;

            case UserRole.Admin:
                return !hasApplicantPayload && !hasCustomerPayload && !hasExecutorPayload;

            default:
                return false;
        }
    }

    private static void ApplyApplicantProfile(ApplicantProfileUpdatePayload? payload, User user)
    {
        if (payload is null)
            return;

        user.ApplicantResumeTitle = NormalizeOptional(payload.ResumeTitle);
        user.ApplicantPreviousCompanyName = NormalizeOptional(payload.PreviousCompanyName);
        user.ApplicantWorkPeriod = NormalizeOptional(payload.WorkPeriod);
        user.ApplicantExperienceSummary = NormalizeOptional(payload.ExperienceSummary);
        user.ApplicantAchievements = NormalizeOptional(payload.Achievements);
        user.ApplicantEducation = NormalizeOptional(payload.Education);
        user.ApplicantSkills = SerializeStringList(payload.Skills);
        user.ApplicantCertificates = SerializeStringList(payload.Certificates);
        user.ApplicantPortfolioUrl = NormalizeOptional(payload.PortfolioUrl);
        user.ApplicantAbout = NormalizeOptional(payload.About);
        user.ApplicantDesiredSalary = payload.DesiredSalary;
    }

    private static void ApplyCustomerProfile(CustomerProfileUpdatePayload? payload, User user)
    {
        if (payload is null)
            return;

        user.CustomerInn = NormalizeOptional(payload.Inn);
        user.CustomerEgrn = NormalizeOptional(payload.Egrn);
        user.CustomerEgrnip = NormalizeOptional(payload.Egrnip);
        user.CustomerCompanyName = NormalizeOptional(payload.CompanyName);
        user.CustomerCompanyLogoUrl = NormalizeOptional(payload.CompanyLogoUrl);
    }

    private static void ApplyExecutorProfile(ExecutorProfileUpdatePayload? payload, User user)
    {
        if (payload is null)
            return;

        user.ExecutorEmploymentType = payload.EmploymentType;
        user.ExecutorProjectTitle = NormalizeOptional(payload.ProjectTitle);
        user.ExecutorProjectCompanyName = NormalizeOptional(payload.ProjectCompanyName);
        user.ExecutorExperienceSummary = NormalizeOptional(payload.ExperienceSummary);
        user.ExecutorAchievements = NormalizeOptional(payload.Achievements);
        user.ExecutorCertificates = SerializeStringList(payload.Certificates);
        user.ExecutorGrade = NormalizeOptional(payload.Grade);
        user.ExecutorExtraInfo = NormalizeOptional(payload.ExtraInfo);
    }

    private static string? NormalizeOptional(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return value.Trim();
    }

    private static string? SerializeStringList(List<string>? values)
    {
        if (values is null || values.Count == 0)
            return null;

        var normalized = values
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value.Trim())
            .ToList();

        if (normalized.Count == 0)
            return null;

        return JsonSerializer.Serialize(normalized);
    }

    private static bool IsValidApplicantPayload(ApplicantProfileUpdatePayload? payload)
    {
        if (payload is null)
            return true;

        if (!IsValidOptionalMaxLength(payload.ResumeTitle, ApplicantResumeTitleMaxLength) ||
            !IsValidOptionalMaxLength(payload.PreviousCompanyName, ApplicantPreviousCompanyNameMaxLength) ||
            !IsValidOptionalMaxLength(payload.WorkPeriod, ApplicantWorkPeriodMaxLength) ||
            !IsValidOptionalMaxLength(payload.ExperienceSummary, ApplicantExperienceSummaryMaxLength) ||
            !IsValidOptionalMaxLength(payload.Achievements, ApplicantAchievementsMaxLength) ||
            !IsValidOptionalMaxLength(payload.Education, ApplicantEducationMaxLength) ||
            !IsValidOptionalUrl(payload.PortfolioUrl, ApplicantPortfolioUrlMaxLength) ||
            !IsValidOptionalMaxLength(payload.About, ApplicantAboutMaxLength))
            return false;

        if (!IsValidOptionalStringList(payload.Skills, ApplicantListSerializedMaxLength) ||
            !IsValidOptionalStringList(payload.Certificates, ApplicantListSerializedMaxLength))
            return false;

        if (payload.DesiredSalary is not null && !IsValidDesiredSalary(payload.DesiredSalary.Value))
            return false;

        return true;
    }

    private static bool IsValidCustomerPayload(CustomerProfileUpdatePayload? payload)
    {
        if (payload is null)
            return true;

        var inn = NormalizeOptional(payload.Inn);
        var egrn = NormalizeOptional(payload.Egrn);
        var egrnip = NormalizeOptional(payload.Egrnip);

        if (!IsValidOptionalMaxLength(payload.CompanyName, CustomerCompanyNameMaxLength) ||
            !IsValidOptionalUrl(payload.CompanyLogoUrl, CustomerCompanyLogoUrlMaxLength))
            return false;

        if (inn is not null && (!InnRegex.IsMatch(inn) || inn.Length > CustomerInnMaxLength))
            return false;

        if (egrn is not null && (!EgrnRegex.IsMatch(egrn) || egrn.Length > CustomerEgrnMaxLength))
            return false;

        if (egrnip is not null && (!EgrnipRegex.IsMatch(egrnip) || egrnip.Length > CustomerEgrnipMaxLength))
            return false;

        return true;
    }

    private static bool IsValidExecutorPayload(ExecutorProfileUpdatePayload? payload)
    {
        if (payload is null)
            return true;

        if (!IsValidOptionalMaxLength(payload.ProjectTitle, ExecutorProjectTitleMaxLength) ||
            !IsValidOptionalMaxLength(payload.ProjectCompanyName, ExecutorProjectCompanyNameMaxLength) ||
            !IsValidOptionalMaxLength(payload.ExperienceSummary, ExecutorExperienceSummaryMaxLength) ||
            !IsValidOptionalMaxLength(payload.Achievements, ExecutorAchievementsMaxLength) ||
            !IsValidOptionalMaxLength(payload.Grade, ExecutorGradeMaxLength) ||
            !IsValidOptionalMaxLength(payload.ExtraInfo, ExecutorExtraInfoMaxLength))
            return false;

        if (!IsValidOptionalStringList(payload.Certificates, ExecutorCertificatesSerializedMaxLength))
            return false;

        return true;
    }

    private static bool IsValidOptionalMaxLength(string? value, int maxLength)
    {
        var normalized = NormalizeOptional(value);
        return normalized is null || normalized.Length <= maxLength;
    }

    private static bool IsValidOptionalUrl(string? value, int maxLength)
    {
        var normalized = NormalizeOptional(value);
        if (normalized is null)
            return true;

        if (normalized.Length > maxLength)
            return false;

        if (!Uri.TryCreate(normalized, UriKind.Absolute, out var uri))
            return false;

        return string.Equals(uri.Scheme, Uri.UriSchemeHttp, StringComparison.OrdinalIgnoreCase) ||
               string.Equals(uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsValidOptionalStringList(List<string>? values, int serializedMaxLength)
    {
        if (values is null || values.Count == 0)
            return true;

        var normalized = values
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value.Trim())
            .ToList();

        if (normalized.Any(value => value.Length > ListItemMaxLength))
            return false;

        if (normalized.Count == 0)
            return true;

        var serialized = JsonSerializer.Serialize(normalized);
        return serialized.Length <= serializedMaxLength;
    }

    private static bool IsValidDesiredSalary(decimal value)
    {
        if (value < 0 || value > MaxDesiredSalary)
            return false;

        return decimal.Round(value, 2) == value;
    }
}
