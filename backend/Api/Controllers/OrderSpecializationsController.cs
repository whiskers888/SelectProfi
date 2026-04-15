using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Orders.CreateOrderSpecialization;
using SelectProfi.backend.Application.Orders.GetOrderSpecializations;
using SelectProfi.backend.Application.Orders.UpdateOrderSpecialization;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Contracts.Orders;
using SelectProfi.backend.Errors;
using SelectProfi.backend.Mappings;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Authorize]
[Route("api/order-specializations")]
[Produces("application/json", "application/problem+json")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
public sealed class OrderSpecializationsController(
    ICommandDispatcher commandDispatcher,
    IQueryDispatcher queryDispatcher) : AuthorizedControllerBase
{
    [HttpGet]
    [Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutorApplicant)]
    [ProducesResponseType(typeof(OrderSpecializationListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList([FromQuery] bool includeInactive, CancellationToken cancellationToken)
    {
        // @dvnull: Ранее контроллер читал specialization напрямую из DbContext; переведено на CQRS-query без доступа API к persistence.
        var result = await queryDispatcher.DispatchAsync<GetOrderSpecializationsQuery, GetOrderSpecializationsResult>(
            (includeInactive && RequesterRole == UserRole.Admin).ToGetOrderSpecializationsQuery(),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpPost]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    [ProducesResponseType(typeof(OrderSpecializationResponse), StatusCodes.Status201Created)]
    [ProducesConflictProblem]
    public async Task<IActionResult> Create(
        [FromBody] CreateOrderSpecializationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<CreateOrderSpecializationCommand, CreateOrderSpecializationResult>(
            request.ToCommand(),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpPatch("{specializationId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.AdminOnly)]
    [ProducesResponseType(typeof(OrderSpecializationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesConflictProblem]
    public async Task<IActionResult> Patch(
        Guid specializationId,
        [FromBody] UpdateOrderSpecializationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<UpdateOrderSpecializationCommand, UpdateOrderSpecializationResult>(
            request.ToCommand(specializationId),
            cancellationToken);

        return result.ToActionResult(this);
    }
}
