using System.Diagnostics;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.SwitchMyActiveRole;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;
using SelectProfi.backend.Contracts.Profile;
using SelectProfi.backend.Mappings;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public sealed class ProfileController(
    IQueryDispatcher queryDispatcher,
    ICommandDispatcher commandDispatcher) : ControllerBase
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

        var result = await queryDispatcher.DispatchAsync<GetMyProfileQuery, GetMyProfileResult>(
            userId.ToGetMyProfileQuery(),
            cancellationToken);

        if (result.ErrorCode == GetMyProfileErrorCode.UserNotFound)
            return NotFound(CreateProblem(
                StatusCodes.Status404NotFound,
                "Not Found",
                "user_not_found",
                "User profile not found."));

        return Ok(result.ToResponse());
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

        var result = await commandDispatcher.DispatchAsync<UpdateMyProfileCommand, UpdateMyProfileResult>(
            request.ToCommand(userId),
            cancellationToken);

        return result.ErrorCode switch
        {
            UpdateMyProfileErrorCode.None => Ok(result.ToResponse()),
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

    [HttpPost("me/active-role")]
    [Produces("application/json", "application/problem+json")]
    [ProducesResponseType(typeof(MyProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SwitchMyActiveRole(
        [FromBody] SwitchMyActiveRoleRequest request,
        CancellationToken cancellationToken)
    {
        var userIdRaw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdRaw, out var userId))
            return Unauthorized(CreateProblem(
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                "invalid_access_token",
                "Invalid access token."));

        var switchResult = await commandDispatcher.DispatchAsync<SwitchMyActiveRoleCommand, SwitchMyActiveRoleResult>(
            request.ToCommand(userId),
            cancellationToken);

        if (switchResult.ErrorCode == SwitchMyActiveRoleErrorCode.UserNotFound)
            return NotFound(CreateProblem(
                StatusCodes.Status404NotFound,
                "Not Found",
                "user_not_found",
                "User profile not found."));

        if (switchResult.ErrorCode == SwitchMyActiveRoleErrorCode.ActiveRoleNotAllowed)
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "Bad Request",
                "active_role_not_allowed",
                "Requested active role is not available for current user."));

        if (switchResult.ErrorCode == SwitchMyActiveRoleErrorCode.Conflict)
            return Conflict(CreateProblem(
                StatusCodes.Status409Conflict,
                "Conflict",
                "profile_conflict",
                "Profile update conflict occurred."));

        var profileResult = await queryDispatcher.DispatchAsync<GetMyProfileQuery, GetMyProfileResult>(
            userId.ToGetMyProfileQuery(),
            cancellationToken);

        if (profileResult.ErrorCode == GetMyProfileErrorCode.UserNotFound)
            return NotFound(CreateProblem(
                StatusCodes.Status404NotFound,
                "Not Found",
                "user_not_found",
                "User profile not found."));

        return Ok(profileResult.ToResponse());
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
}
