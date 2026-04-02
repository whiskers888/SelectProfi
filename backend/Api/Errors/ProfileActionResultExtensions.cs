using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.SwitchMyActiveRole;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;
using SelectProfi.backend.Mappings;

namespace SelectProfi.backend.Errors;

public static class ProfileActionResultExtensions
{
    public static IActionResult ToActionResult(this GetMyProfileResult result, ControllerBase controller)
    {
        if (result.ErrorCode == GetMyProfileErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(ProfileProblemMap.Resolve(result.ErrorCode));
    }

    public static IActionResult ToActionResult(this UpdateMyProfileResult result, ControllerBase controller)
    {
        if (result.ErrorCode == UpdateMyProfileErrorCode.None)
            return controller.Ok(result.ToResponse());

        return controller.ToProblem(ProfileProblemMap.Resolve(result.ErrorCode));
    }

    public static Task<IActionResult> ToActionResultAsync(
        this SwitchMyActiveRoleResult result,
        ControllerBase controller,
        Func<Task<IActionResult>> onSuccess)
    {
        if (result.ErrorCode == SwitchMyActiveRoleErrorCode.None)
            return onSuccess();

        return Task.FromResult(controller.ToProblem(ProfileProblemMap.Resolve(result.ErrorCode)));
    }
}
