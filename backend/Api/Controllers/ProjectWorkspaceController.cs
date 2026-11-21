using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Orders.ProjectWorkspace;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Contracts.Orders;
using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Authorize]
[Route("api/orders/{orderId:guid}")]
[Produces("application/json", "application/problem+json")]
public sealed class ProjectWorkspaceController(
    ICommandDispatcher commandDispatcher,
    IQueryDispatcher queryDispatcher) : AuthorizedControllerBase
{
    [HttpGet("history")]
    [Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutor)]
    [ProducesResponseType(typeof(ProjectActivityListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHistory(Guid orderId, CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetProjectHistoryQuery, ProjectHistoryResult>(
            new GetProjectHistoryQuery(orderId, RequesterUserId, RequesterRole),
            cancellationToken);
        if (result.ErrorCode != ProjectWorkspaceErrorCode.None)
            return Failure(result.ErrorCode);

        return Ok(new ProjectActivityListResponse(result.Items.Select(item => new ProjectActivityResponse(
            item.Id,
            item.Action,
            item.Description,
            item.CreatedAtUtc)).ToArray()));
    }

    [HttpGet("documents")]
    [Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutor)]
    [ProducesResponseType(typeof(ProjectDocumentListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDocuments(Guid orderId, CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetProjectDocumentsQuery, ProjectDocumentsResult>(
            new GetProjectDocumentsQuery(orderId, RequesterUserId, RequesterRole),
            cancellationToken);
        if (result.ErrorCode != ProjectWorkspaceErrorCode.None)
            return Failure(result.ErrorCode);

        return Ok(new ProjectDocumentListResponse(result.Items.Select(ToResponse).ToArray()));
    }

    [HttpGet("documents/{documentId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutor)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DownloadDocument(
        Guid orderId,
        Guid documentId,
        CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetProjectDocumentQuery, ProjectDocumentDownloadResult>(
            new GetProjectDocumentQuery(orderId, documentId, RequesterUserId, RequesterRole),
            cancellationToken);
        if (result.ErrorCode != ProjectWorkspaceErrorCode.None)
            return Failure(result.ErrorCode);

        return File(result.Content, result.ContentType, result.FileName);
    }

    [HttpPost("documents")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(ProjectDocumentFilePolicy.MaximumLength + 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = ProjectDocumentFilePolicy.MaximumLength + 1024 * 1024)]
    [ProducesResponseType(typeof(ProjectDocumentResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> UploadDocument(
        Guid orderId,
        [FromForm(Name = "file")] IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file is null)
            return InvalidDocument();

        using var content = file.OpenReadStream();
        var result = await commandDispatcher.DispatchAsync<UploadProjectDocumentCommand, ProjectWorkspaceCommandResult>(
            new UploadProjectDocumentCommand(orderId, RequesterUserId, file.FileName, file.Length, content),
            cancellationToken);
        if (result.ErrorCode != ProjectWorkspaceErrorCode.None)
            return Failure(result.ErrorCode);

        var document = ToResponse(result.Document!);
        return Created($"/api/orders/{orderId}/documents/{document.Id}", document);
    }

    [HttpPut("deadline")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(ProjectDueDateResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> SetDueDate(
        Guid orderId,
        [FromBody] SetProjectDueDateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<SetProjectDueDateCommand, ProjectWorkspaceCommandResult>(
            new SetProjectDueDateCommand(orderId, RequesterUserId, request.DueDate),
            cancellationToken);
        if (result.ErrorCode != ProjectWorkspaceErrorCode.None)
            return Failure(result.ErrorCode);

        return Ok(new ProjectDueDateResponse(result.OrderId, result.DueDate, result.UpdatedAtUtc));
    }

    [HttpDelete("deadline")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(ProjectDueDateResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ClearDueDate(Guid orderId, CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<SetProjectDueDateCommand, ProjectWorkspaceCommandResult>(
            new SetProjectDueDateCommand(orderId, RequesterUserId, null),
            cancellationToken);
        if (result.ErrorCode != ProjectWorkspaceErrorCode.None)
            return Failure(result.ErrorCode);

        return Ok(new ProjectDueDateResponse(result.OrderId, result.DueDate, result.UpdatedAtUtc));
    }

    private static ProjectDocumentResponse ToResponse(ProjectDocument document) =>
        new(document.Id, document.FileName, document.ContentType, document.Length, document.CreatedAtUtc);

    private IActionResult Failure(ProjectWorkspaceErrorCode errorCode) => errorCode switch
    {
        ProjectWorkspaceErrorCode.NotFound => Problem(
            statusCode: StatusCodes.Status404NotFound,
            title: "Не найдено",
            detail: "Проект или документ не найден."),
        ProjectWorkspaceErrorCode.Forbidden => Forbid(),
        ProjectWorkspaceErrorCode.ProjectCompleted => Problem(
            statusCode: StatusCodes.Status409Conflict,
            title: "Проект завершен",
            detail: "Завершенный проект нельзя изменить."),
        ProjectWorkspaceErrorCode.InvalidFile => InvalidDocument(),
        _ => Problem(statusCode: StatusCodes.Status500InternalServerError, title: "Ошибка проекта")
    };

    private IActionResult InvalidDocument() => Problem(
        statusCode: StatusCodes.Status400BadRequest,
        title: "Недопустимый файл",
        detail: "Поддерживаются PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, RTF, JPG и PNG размером до 25 МБ.");
}
