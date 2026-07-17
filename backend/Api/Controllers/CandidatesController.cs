using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Application.Candidates.CreateCandidateResume;
using SelectProfi.backend.Application.Candidates.GetMyCandidates;
using SelectProfi.backend.Application.Candidates.UploadCandidateResumeAttachment;
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
    [HttpPost("resumes/{resumeId:guid}/attachments")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesBadRequestProblem]
    public async Task<IActionResult> UploadMyCandidateResumeAttachment(
        Guid resumeId,
        [FromForm] IFormFile? file,
        [FromForm] string? attachmentType,
        [FromForm] string? customType,
        CancellationToken cancellationToken)
    {
        if (file is null)
            return BadRequest(new ProblemDetails { Title = "Ошибка валидации", Status = StatusCodes.Status400BadRequest, Detail = "Файл обязателен." });

        await using var content = file.OpenReadStream();
        var result = await commandDispatcher.DispatchAsync<UploadCandidateResumeAttachmentCommand, UploadCandidateResumeAttachmentResult>(
            new UploadCandidateResumeAttachmentCommand
            {
                ResumeId = resumeId,
                RequesterUserId = RequesterUserId,
                Content = content,
                FileName = file.FileName,
                ContentType = file.ContentType,
                Length = file.Length,
                AttachmentType = attachmentType ?? string.Empty,
                CustomType = customType
            },
            cancellationToken);

        return result.Success
            ? Created($"/api/candidates/resumes/{resumeId}/attachments/{result.AttachmentId}", new { result.AttachmentId })
            : BadRequest(new ProblemDetails { Title = "Ошибка валидации", Status = StatusCodes.Status400BadRequest, Detail = "Файл не принят." });
    }

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
