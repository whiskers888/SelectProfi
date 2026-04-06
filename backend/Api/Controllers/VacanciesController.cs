using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Application.Candidates.AddCandidateFromBase;
using SelectProfi.backend.Application.Candidates.CreateCandidateResume;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;
using SelectProfi.backend.Application.Candidates.GetVacancyCandidates;
using SelectProfi.backend.Application.Candidates.GetSelectedCandidateContacts;
using SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;
using SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Vacancies.CreateVacancy;
using SelectProfi.backend.Application.Vacancies.DeleteVacancy;
using SelectProfi.backend.Application.Vacancies.GetVacancies;
using SelectProfi.backend.Application.Vacancies.GetVacancyById;
using SelectProfi.backend.Application.Vacancies.UpdateVacancy;
using SelectProfi.backend.Application.Vacancies.UpdateVacancyStatus;
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
    [Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutorApplicant)]
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
    [Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutorApplicant)]
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

    [HttpPatch("{vacancyId:guid}/status")]
    [Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutor)]
    [ProducesResponseType(typeof(VacancyResponse), StatusCodes.Status200OK)]
    [ProducesBadRequestProblem]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    // @dvnull: Добавлен endpoint смены статуса вакансии для жизненного цикла согласования и публикации.
    public async Task<IActionResult> UpdateStatus(
        Guid vacancyId,
        [FromBody] UpdateVacancyStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<UpdateVacancyStatusCommand, UpdateVacancyStatusResult>(
            request.ToCommand(vacancyId, RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpPost("{vacancyId:guid}/candidates/resumes")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(CandidateResumeResponse), StatusCodes.Status201Created)]
    [ProducesBadRequestProblem]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    // @dvnull: Добавлен endpoint ручного добавления кандидата с резюме в vacancy pipeline без расширения scope на отдельный CandidatesController.
    public async Task<IActionResult> CreateCandidateResume(
        Guid vacancyId,
        [FromBody] CreateCandidateResumeRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<CreateCandidateResumeCommand, CreateCandidateResumeResult>(
            request.ToCommand(vacancyId, RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpPost("{vacancyId:guid}/candidates/{candidateId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(VacancyCandidateResponse), StatusCodes.Status201Created)]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    // @dvnull: Добавлен отдельный endpoint для добавления зарегистрированного кандидата из системной базы в pipeline вакансии.
    public async Task<IActionResult> AddCandidateFromBase(
        Guid vacancyId,
        Guid candidateId,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<AddCandidateFromBaseCommand, AddCandidateFromBaseResult>(
            candidateId.ToCommand(vacancyId, RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpPatch("{vacancyId:guid}/candidates/{candidateId:guid}/stage")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(VacancyCandidateResponse), StatusCodes.Status200OK)]
    [ProducesBadRequestProblem]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    // @dvnull: Добавлен endpoint смены стадии кандидата в pipeline вакансии (Pool/Shortlist) с валидацией инварианта selectedCandidate.
    public async Task<IActionResult> UpdateCandidateStage(
        Guid vacancyId,
        Guid candidateId,
        [FromBody] UpdateVacancyCandidateStageRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher
            .DispatchAsync<UpdateVacancyCandidateStageCommand, UpdateVacancyCandidateStageResult>(
                request.ToCommand(vacancyId, candidateId, RequesterUserId, RequesterRole),
                cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpPatch("{vacancyId:guid}/selected-candidate")]
    [Authorize(Policy = AuthorizationPolicies.CustomerOnly)]
    [ProducesResponseType(typeof(SelectedVacancyCandidateResponse), StatusCodes.Status200OK)]
    [ProducesBadRequestProblem]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    // @dvnull: Добавлен endpoint финального выбора кандидата заказчиком только из shortlist в рамках одной вакансии.
    public async Task<IActionResult> SelectCandidate(
        Guid vacancyId,
        [FromBody] SelectVacancyCandidateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<SelectVacancyCandidateCommand, SelectVacancyCandidateResult>(
            request.ToCommand(vacancyId, RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpGet("{vacancyId:guid}/selected-candidate/contacts")]
    [Authorize(Policy = AuthorizationPolicies.CustomerOnly)]
    [ProducesResponseType(typeof(SelectedCandidateContactsResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    // @dvnull: Добавлен endpoint выдачи контактов только выбранного финального кандидата владельцу вакансии.
    public async Task<IActionResult> GetSelectedCandidateContacts(
        Guid vacancyId,
        CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetSelectedCandidateContactsQuery, GetSelectedCandidateContactsResult>(
            vacancyId.ToGetSelectedCandidateContactsQuery(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpGet("{vacancyId:guid}/candidates/{candidateId:guid}/contacts")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(ExecutorCandidateContactsResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    // @dvnull: Добавлен endpoint выдачи контактов кандидата назначенному рекрутеру только при owner+TTL доступе.
    public async Task<IActionResult> GetCandidateContactsForExecutor(
        Guid vacancyId,
        Guid candidateId,
        CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<
            GetVacancyCandidateContactsForExecutorQuery,
            GetVacancyCandidateContactsForExecutorResult>(
            candidateId.ToGetVacancyCandidateContactsForExecutorQuery(vacancyId, RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpGet("{vacancyId:guid}/candidates")]
    [Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutor)]
    [ProducesResponseType(typeof(VacancyCandidatesResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    // @dvnull: Добавлен endpoint чтения обезличенного pipeline кандидатов по вакансии для customer/executor/admin без раскрытия контактов.
    public async Task<IActionResult> GetVacancyCandidates(
        Guid vacancyId,
        CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetVacancyCandidatesQuery, GetVacancyCandidatesResult>(
            vacancyId.ToGetVacancyCandidatesQuery(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }
}
