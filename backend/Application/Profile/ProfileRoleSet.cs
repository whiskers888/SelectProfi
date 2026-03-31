using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Profile;

public static class ProfileRoleSet
{
    public static IReadOnlyList<string> Resolve(UserRole activeRole)
    {
        return activeRole switch
        {
            UserRole.Applicant => [nameof(UserRole.Applicant), nameof(UserRole.Executor)],
            UserRole.Executor => [nameof(UserRole.Executor), nameof(UserRole.Applicant)],
            UserRole.Customer => [nameof(UserRole.Customer)],
            UserRole.Admin => [nameof(UserRole.Admin)],
            _ => [activeRole.ToString()]
        };
    }
}
