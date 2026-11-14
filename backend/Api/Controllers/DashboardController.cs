using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Dashboard.GetCustomerDashboardStats;
using SelectProfi.backend.Application.Dashboard.GetExecutorDashboardStats;
using SelectProfi.backend.Application.Dashboard.GetApplicantDashboardStats;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Contracts.Dashboard;
using SelectProfi.backend.Contracts.Vacancies;
using SelectProfi.backend.Domain.Candidates;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
[Produces("application/json", "application/problem+json")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
public sealed class DashboardController(IQueryDispatcher queryDispatcher) : AuthorizedControllerBase
{
    [HttpGet("customer-stats")]
    [HttpGet("customer")]
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
            OnApprovalVacanciesCount = result.OnApprovalVacanciesCount,
            AvailableBalance = result.AvailableBalance,
            ReservedBalance = result.ReservedBalance,
            CurrencyCode = result.CurrencyCode,
            UnreadNotificationsCount = result.UnreadNotificationsCount
        });
    }

    [HttpGet("executor-stats")]
    [HttpGet("executor")]
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
            OnApprovalVacanciesCount = result.OnApprovalVacanciesCount,
            AvailableBalance = result.AvailableBalance,
            ReservedBalance = result.ReservedBalance,
            CurrencyCode = result.CurrencyCode,
            UnreadNotificationsCount = result.UnreadNotificationsCount
        });
    }

    [HttpGet("applicant")]
    [Authorize(Policy = AuthorizationPolicies.ApplicantOnly)]
    [ProducesResponseType(typeof(ApplicantDashboardStatsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetApplicantStats(CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetApplicantDashboardStatsQuery, GetApplicantDashboardStatsResult>(
            new GetApplicantDashboardStatsQuery
            {
                RequesterUserId = RequesterUserId,
                RequesterRole = RequesterRole
            },
            cancellationToken);

        if (result.ErrorCode == GetApplicantDashboardStatsErrorCode.Forbidden)
        {
            return Forbid();
        }

        return Ok(new ApplicantDashboardStatsResponse
        {
            ApplicationsCount = result.ApplicationsCount,
            UnclassifiedCandidateLinksCount = result.UnclassifiedCandidateLinksCount,
            ShortlistCandidatesCount = result.ShortlistCandidatesCount,
            UnreadNotificationsCount = result.UnreadNotificationsCount,
            ResumeTitle = result.ResumeTitle,
            Applications = result.Applications.Select(application => new ApplicantDashboardApplicationResponse
            {
                VacancyId = application.VacancyId,
                VacancyTitle = application.VacancyTitle,
                CompanyName = application.CompanyName,
                Stage = MapStage(application.Stage),
                SubmittedAtUtc = application.SubmittedAtUtc,
                FirstViewedAtUtc = application.FirstViewedAtUtc
            }).ToArray()
        });
    }

    private static VacancyCandidateStageContract MapStage(VacancyCandidateStage stage) => stage switch
    {
        VacancyCandidateStage.Pool => VacancyCandidateStageContract.Pool,
        VacancyCandidateStage.Shortlist => VacancyCandidateStageContract.Shortlist,
        _ => throw new ArgumentOutOfRangeException(nameof(stage), stage, null)
    };
}
