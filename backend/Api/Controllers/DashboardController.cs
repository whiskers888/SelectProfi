using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Dashboard.GetCustomerDashboardStats;
using SelectProfi.backend.Application.Dashboard.GetExecutorDashboardStats;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Contracts.Dashboard;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
[Produces("application/json", "application/problem+json")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
public sealed class DashboardController(IQueryDispatcher queryDispatcher) : AuthorizedControllerBase
{
    [HttpGet("customer-stats")]
    [Authorize(Policy = AuthorizationPolicies.CustomerOnly)]
    [ProducesResponseType(typeof(CustomerDashboardStatsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCustomerStats(CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetCustomerDashboardStatsQuery, GetCustomerDashboardStatsResult>(
            new GetCustomerDashboardStatsQuery
            {
                RequesterUserId = RequesterUserId,
                RequesterRole = RequesterRole
            },
            cancellationToken);

        if (result.ErrorCode == GetCustomerDashboardStatsErrorCode.Forbidden)
        {
            return Forbid();
        }

        return Ok(new CustomerDashboardStatsResponse
        {
            ActiveProjectsCount = result.ActiveProjectsCount,
            PipelineCandidatesCount = result.PipelineCandidatesCount,
            ShortlistCandidatesCount = result.ShortlistCandidatesCount,
            OnApprovalVacanciesCount = result.OnApprovalVacanciesCount
        });
    }

    [HttpGet("executor-stats")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(ExecutorDashboardStatsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetExecutorStats(CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetExecutorDashboardStatsQuery, GetExecutorDashboardStatsResult>(
            new GetExecutorDashboardStatsQuery
            {
                RequesterUserId = RequesterUserId,
                RequesterRole = RequesterRole
            },
            cancellationToken);

        if (result.ErrorCode == GetExecutorDashboardStatsErrorCode.Forbidden)
        {
            return Forbid();
        }

        return Ok(new ExecutorDashboardStatsResponse
        {
            ActiveProjectsCount = result.ActiveProjectsCount,
            PipelineCandidatesCount = result.PipelineCandidatesCount,
            ShortlistCandidatesCount = result.ShortlistCandidatesCount,
            OnApprovalVacanciesCount = result.OnApprovalVacanciesCount
        });
    }
}
