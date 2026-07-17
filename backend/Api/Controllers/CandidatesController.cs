using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Application.Candidates.CreateCandidateResume;
using SelectProfi.backend.Application.Candidates.GetMyCandidates;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Contracts.Vacancies;
using SelectProfi.backend.Contracts.Candidates;
using SelectProfi.backend.Errors;
using SelectProfi.backend.Mappings;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
[Route("api/candidates")]
[Produces("application/json", "application/problem+json")]
public sealed class CandidatesController(ICommandDispatcher commandDispatcher, IQueryDispatcher queryDispatcher) : AuthorizedControllerBase
{
    [HttpGet("mine")]
    [ProducesResponseType(typeof(IReadOnlyList<MyCandidateResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyCandidates(CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetMyCandidatesQuery, GetMyCandidatesResult>(
            new GetMyCandidatesQuery { RequesterUserId = RequesterUserId },
            cancellationToken);

        return Ok(result.Items.Select(item => new MyCandidateResponse
        {
            CandidateId = item.CandidateId,
            FullName = item.FullName,
            SpecializationName = item.SpecializationName,
            ResumeTitle = item.ResumeTitle,
            UpdatedAtUtc = item.UpdatedAtUtc
        }));
    }

    [HttpPost("resumes")]
    [ProducesResponseType(typeof(CandidateResumeResponse), StatusCodes.Status201Created)]
    [ProducesBadRequestProblem]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    public async Task<IActionResult> CreateMyCandidateResume(
        [FromBody] CreateCandidateResumeRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<CreateCandidateResumeCommand, CreateCandidateResumeResult>(
            request.ToCommand(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }
}
