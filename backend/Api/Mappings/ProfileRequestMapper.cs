using Riok.Mapperly.Abstractions;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;
using SelectProfi.backend.Contracts.Profile;
using DomainExecutorEmploymentType = SelectProfi.backend.Domain.Users.ExecutorEmploymentType;

namespace SelectProfi.backend.Mappings;

[Mapper]
public static partial class ProfileRequestMapper
{
    public static GetMyProfileQuery ToGetMyProfileQuery(this Guid userId)
    {
        return new GetMyProfileQuery
        {
            UserId = userId
        };
    }

    public static UpdateMyProfileCommand ToCommand(this UpdateMyProfileRequest request, Guid userId)
    {
        return new UpdateMyProfileCommand
        {
            UserId = userId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            ApplicantProfile = request.ApplicantProfile.ToPayload(),
            CustomerProfile = request.CustomerProfile.ToPayload(),
            ExecutorProfile = request.ExecutorProfile.ToPayload()
        };
    }

    public static partial ApplicantProfileUpdatePayload? ToPayload(this ApplicantProfileUpdateRequest? request);

    public static partial CustomerProfileUpdatePayload? ToPayload(this CustomerProfileUpdateRequest? request);

    public static ExecutorProfileUpdatePayload? ToPayload(this ExecutorProfileUpdateRequest? request)
    {
        if (request is null)
            return null;

        return new ExecutorProfileUpdatePayload
        {
            EmploymentType = MapExecutorEmploymentTypeToDomain(request.EmploymentType),
            ProjectTitle = request.ProjectTitle,
            ProjectCompanyName = request.ProjectCompanyName,
            ExperienceSummary = request.ExperienceSummary,
            Achievements = request.Achievements,
            Certificates = request.Certificates,
            Grade = request.Grade,
            ExtraInfo = request.ExtraInfo
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
