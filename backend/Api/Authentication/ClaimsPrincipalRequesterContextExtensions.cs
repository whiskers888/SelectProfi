using System.Security.Claims;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Authentication;

public static class ClaimsPrincipalRequesterContextExtensions
{
    public static RequesterContext GetRequiredRequesterContext(this ClaimsPrincipal user)
    {
        var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = Enum.Parse<UserRole>(user.FindFirstValue(ClaimTypes.Role)!, ignoreCase: true);

        return new RequesterContext(userId, role);
    }
}
