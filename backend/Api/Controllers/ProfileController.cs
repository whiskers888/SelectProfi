using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.SwitchMyActiveRole;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;
using SelectProfi.backend.Contracts.Profile;
using SelectProfi.backend.Errors;
using SelectProfi.backend.Mappings;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
[Produces("application/json", "application/problem+json")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
// @dvnull: Сообщения ProblemDetails переведены на русский для корректного отображения на фронтенде.
// @dvnull: Контекст пользователя теперь читается напрямую из claims после строгой проверки в authentication handler.
// @dvnull: Маппинг ErrorCode -> ProblemDetails вынесен в ProfileProblemMap для сокращения дублирования.
public sealed class ProfileController(
    IQueryDispatcher queryDispatcher,
    ICommandDispatcher commandDispatcher) : AuthorizedControllerBase
{
    [HttpGet("me")]
    [ProducesResponseType(typeof(MyProfileResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyProfile(CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetMyProfileQuery, GetMyProfileResult>(
            RequesterUserId.ToGetMyProfileQuery(),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpPut("me")]
    [ProducesResponseType(typeof(MyProfileResponse), StatusCodes.Status200OK)]
    [ProducesBadRequestProblem]
    [ProducesConflictProblem]
    public async Task<IActionResult> UpdateMyProfile(
        [FromBody] UpdateMyProfileRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<UpdateMyProfileCommand, UpdateMyProfileResult>(
            request.ToCommand(RequesterUserId),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpPost("me/active-role")]
    [ProducesResponseType(typeof(MyProfileResponse), StatusCodes.Status200OK)]
    [ProducesBadRequestProblem]
    [ProducesConflictProblem]
    public async Task<IActionResult> SwitchMyActiveRole(
        [FromBody] SwitchMyActiveRoleRequest request,
        CancellationToken cancellationToken)
    {
        var switchResult = await commandDispatcher.DispatchAsync<SwitchMyActiveRoleCommand, SwitchMyActiveRoleResult>(
            request.ToCommand(RequesterUserId),
            cancellationToken);

        return await switchResult.ToActionResultAsync(
            this,
            async () =>
            {
                var profileResult = await queryDispatcher.DispatchAsync<GetMyProfileQuery, GetMyProfileResult>(
                    RequesterUserId.ToGetMyProfileQuery(),
                    cancellationToken);
                return profileResult.ToActionResult(this);
            });
    }
}
