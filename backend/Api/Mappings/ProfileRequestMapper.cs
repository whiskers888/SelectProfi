using Riok.Mapperly.Abstractions;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.SwitchMyActiveRole;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;
using SelectProfi.backend.Contracts.Profile;
using DomainCustomerLegalForm = SelectProfi.backend.Domain.Users.CustomerLegalForm;
using DomainExecutorEmploymentType = SelectProfi.backend.Domain.Users.ExecutorEmploymentType;
using DomainUserRole = SelectProfi.backend.Domain.Users.UserRole;

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

    public static SwitchMyActiveRoleCommand ToCommand(this SwitchMyActiveRoleRequest request, Guid userId)
    {
        if (!request.ActiveRole.HasValue)
            throw new InvalidOperationException("Active role is required.");

        return new SwitchMyActiveRoleCommand
        {
            UserId = userId,
            ActiveRole = MapProfileRoleToDomain(request.ActiveRole.Value)
        };
    }

    public static partial ApplicantProfileUpdatePayload? ToPayload(this ApplicantProfileUpdateRequest? request);

    public static CustomerProfileUpdatePayload? ToPayload(this CustomerProfileUpdateRequest? request)
    {
        if (request is null)
            return null;

        return new CustomerProfileUpdatePayload
        {
            Inn = request.Inn,
            LegalForm = MapCustomerLegalFormToDomain(request.LegalForm),
            Egrn = request.Egrn,
            Egrnip = request.Egrnip,
            CompanyName = request.CompanyName,
            CompanyLogoUrl = request.CompanyLogoUrl,
            OfferAccepted = request.OfferAccepted,
            OfferVersion = request.OfferVersion
        };
    }

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

    private static DomainCustomerLegalForm? MapCustomerLegalFormToDomain(CustomerLegalForm? value)
    {
        return value switch
        {
            CustomerLegalForm.Ooo => DomainCustomerLegalForm.Ooo,
            CustomerLegalForm.Ip => DomainCustomerLegalForm.Ip,
            _ => null
        };
    }

    private static DomainUserRole MapProfileRoleToDomain(ProfileUserRole value)
    {
        return value switch
        {
            ProfileUserRole.Applicant => DomainUserRole.Applicant,
            ProfileUserRole.Executor => DomainUserRole.Executor,
            ProfileUserRole.Customer => DomainUserRole.Customer,
            ProfileUserRole.Admin => DomainUserRole.Admin,
            _ => throw new ArgumentOutOfRangeException(nameof(value), value, "Unsupported profile role.")
        };
    }
}
