using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Vacancies.CreateVacancy;
using SelectProfi.backend.Application.Vacancies.DeleteVacancy;
using SelectProfi.backend.Application.Vacancies.GetVacancies;
using SelectProfi.backend.Application.Vacancies.GetVacancyById;
using SelectProfi.backend.Application.Vacancies.UpdateVacancy;
using SelectProfi.backend.Contracts.Vacancies;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Errors;
using SelectProfi.backend.Mappings;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Authorize]
[Route("api/vacancies")]
[Produces("application/json", "application/problem+json")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
// @dvnull: Сообщения ProblemDetails переведены на русский для корректного отображения на фронтенде.
// @dvnull: Контекст пользователя теперь читается напрямую из claims после строгой проверки в authentication handler.
// @dvnull: Маппинг ErrorCode -> ProblemDetails вынесен в VacanciesProblemMap для сокращения дублирования.
public sealed class VacanciesController(
    ICommandDispatcher commandDispatcher,
    IQueryDispatcher queryDispatcher) : AuthorizedControllerBase
{
    [HttpPost]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(VacancyResponse), StatusCodes.Status201Created)]
    [ProducesBadRequestProblem]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    public async Task<IActionResult> Create([FromBody] CreateVacancyRequest request, CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<CreateVacancyCommand, CreateVacancyResult>(
            request.ToCommand(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpGet("{vacancyId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutor)]
    [ProducesResponseType(typeof(VacancyResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    public async Task<IActionResult> GetById(Guid vacancyId, CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetVacancyByIdQuery, GetVacancyByIdResult>(
            vacancyId.ToGetByIdQuery(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpGet]
    [Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutor)]
    [ProducesResponseType(typeof(VacancyListResponse), StatusCodes.Status200OK)]
    [ProducesBadRequestProblem]
    [ProducesForbiddenProblem]
    public async Task<IActionResult> GetList([FromQuery] GetVacanciesRequest request, CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetVacanciesQuery, GetVacanciesResult>(
            request.ToQuery(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpPatch("{vacancyId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(VacancyResponse), StatusCodes.Status200OK)]
    [ProducesBadRequestProblem]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    public async Task<IActionResult> Patch(
        Guid vacancyId,
        [FromBody] UpdateVacancyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<UpdateVacancyCommand, UpdateVacancyResult>(
            request.ToCommand(vacancyId, RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpDelete("{vacancyId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    public async Task<IActionResult> Delete(Guid vacancyId, CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<DeleteVacancyCommand, DeleteVacancyResult>(
            vacancyId.ToDeleteVacancyCommand(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }
}
