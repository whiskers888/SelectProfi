using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;
using SelectProfi.backend.Contracts.Profile;
using DomainExecutorEmploymentType = SelectProfi.backend.Domain.Users.ExecutorEmploymentType;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public sealed class  ProfileController(
    IGetMyProfileUseCase getMyProfileUseCase,
    IUpdateMyProfileUseCase updateMyProfileUseCase) : ControllerBase
{
    [HttpGet("me")]
    [Produces("application/json", "application/problem+json")]
    [ProducesResponseType(typeof(MyProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyProfile(CancellationToken cancellationToken)
    {
        var userIdRaw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdRaw, out var userId))
            return Unauthorized(CreateProblem(
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                "invalid_access_token",
                "Invalid access token."));

        var result = await getMyProfileUseCase.ExecuteAsync(
            new GetMyProfileQuery
            {
                UserId = userId
            },
            cancellationToken);

        if (result.ErrorCode == GetMyProfileErrorCode.UserNotFound)
            return NotFound(CreateProblem(
                StatusCodes.Status404NotFound,
                "Not Found",
                "user_not_found",
                "User profile not found."));

        return Ok(new MyProfileResponse
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
        });
    }

    [HttpPut("me")]
    [Produces("application/json", "application/problem+json")]
    [ProducesResponseType(typeof(MyProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateMyProfile(
        [FromBody] UpdateMyProfileRequest request,
        CancellationToken cancellationToken)
    {
        var userIdRaw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdRaw, out var userId))
            return Unauthorized(CreateProblem(
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                "invalid_access_token",
                "Invalid access token."));

        var result = await updateMyProfileUseCase.ExecuteAsync(
            new UpdateMyProfileCommand
            {
                UserId = userId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                ApplicantProfile = request.ApplicantProfile is null
                    ? null
                    : new ApplicantProfileUpdatePayload
                    {
                        ResumeTitle = request.ApplicantProfile.ResumeTitle,
                        PreviousCompanyName = request.ApplicantProfile.PreviousCompanyName,
                        WorkPeriod = request.ApplicantProfile.WorkPeriod,
                        ExperienceSummary = request.ApplicantProfile.ExperienceSummary,
                        Achievements = request.ApplicantProfile.Achievements,
                        Education = request.ApplicantProfile.Education,
                        Skills = request.ApplicantProfile.Skills,
                        Certificates = request.ApplicantProfile.Certificates,
                        PortfolioUrl = request.ApplicantProfile.PortfolioUrl,
                        About = request.ApplicantProfile.About,
                        DesiredSalary = request.ApplicantProfile.DesiredSalary
                    },
                CustomerProfile = request.CustomerProfile is null
                    ? null
                    : new CustomerProfileUpdatePayload
                    {
                        Inn = request.CustomerProfile.Inn,
                        Egrn = request.CustomerProfile.Egrn,
                        Egrnip = request.CustomerProfile.Egrnip,
                        CompanyName = request.CustomerProfile.CompanyName,
                        CompanyLogoUrl = request.CustomerProfile.CompanyLogoUrl
                    },
                ExecutorProfile = request.ExecutorProfile is null
                    ? null
                    : new ExecutorProfileUpdatePayload
                    {
                        EmploymentType = MapExecutorEmploymentTypeToDomain(request.ExecutorProfile.EmploymentType),
                        ProjectTitle = request.ExecutorProfile.ProjectTitle,
                        ProjectCompanyName = request.ExecutorProfile.ProjectCompanyName,
                        ExperienceSummary = request.ExecutorProfile.ExperienceSummary,
                        Achievements = request.ExecutorProfile.Achievements,
                        Certificates = request.ExecutorProfile.Certificates,
                        Grade = request.ExecutorProfile.Grade,
                        ExtraInfo = request.ExecutorProfile.ExtraInfo
                    }
            },
            cancellationToken);

        return result.ErrorCode switch
        {
            UpdateMyProfileErrorCode.None => Ok(new MyProfileResponse
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
            }),
            UpdateMyProfileErrorCode.UserNotFound => NotFound(CreateProblem(
                StatusCodes.Status404NotFound,
                "Not Found",
                "user_not_found",
                "User profile not found.")),
            UpdateMyProfileErrorCode.InvalidRoleSpecificPayload => BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "Bad Request",
                "invalid_role_specific_profile_payload",
                "Role-specific profile payload is invalid for current user role.")),
            _ => Conflict(CreateProblem(
                StatusCodes.Status409Conflict,
                "Conflict",
                "phone_already_exists",
                "Phone is already registered."))
        };
    }

    private ProblemDetails CreateProblem(int status, string title, string code, string detail)
    {
        var problemDetails = new ProblemDetails
        {
            Type = $"https://httpstatuses.com/{status}",
            Title = title,
            Status = status,
            Detail = detail,
            Instance = HttpContext.Request.Path
        };

        problemDetails.Extensions["code"] = code;
        problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;

        return problemDetails;
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

    private static DomainExecutorEmploymentType? MapExecutorEmploymentTypeToDomain(ExecutorEmploymentType? value)
    {
        return value switch
        {
            ExecutorEmploymentType.Fl => DomainExecutorEmploymentType.Fl,
            ExecutorEmploymentType.Smz => DomainExecutorEmploymentType.Smz,
            ExecutorEmploymentType.Ip => DomainExecutorEmploymentType.Ip,
            _ => null
        };
    }
}
