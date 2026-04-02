using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Application.Orders.DeleteOrder;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Contracts.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Errors;
using SelectProfi.backend.Mappings;

namespace SelectProfi.backend.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
[Produces("application/json", "application/problem+json")]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
[ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
// @dvnull: Сообщения ProblemDetails переведены на русский для корректного отображения на фронтенде.
// @dvnull: Контекст пользователя теперь читается напрямую из claims после строгой проверки в authentication handler.
// @dvnull: Маппинг ErrorCode -> ProblemDetails вынесен в OrdersProblemMap для сокращения дублирования.
public sealed class OrdersController(
    ICommandDispatcher commandDispatcher,
    IQueryDispatcher queryDispatcher) : AuthorizedControllerBase
{
    [HttpPost]
    [Authorize(Policy = AuthorizationPolicies.CustomerOnly)]
    [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status201Created)]
    [ProducesBadRequestProblem]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesConflictProblem]
    public async Task<IActionResult> Create(
        [FromBody] CreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<CreateOrderCommand, CreateOrderResult>(
            request.ToCommand(RequesterUserId),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpGet("{orderId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutor)]
    [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    public async Task<IActionResult> GetById(Guid orderId, CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetOrderByIdQuery, GetOrderByIdResult>(
            orderId.ToQuery(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpGet]
    [Authorize(Policy = AuthorizationPolicies.CustomerAdminExecutor)]
    [ProducesResponseType(typeof(OrderListResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    [ProducesBadRequestProblem]
    public async Task<IActionResult> GetList(
        [FromQuery] GetOrdersRequest request,
        CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetOrdersQuery, GetOrdersResult>(
            request.ToQuery(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpPatch("{orderId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.CustomerOrAdmin)]
    [ProducesResponseType(typeof(OrderResponse), StatusCodes.Status200OK)]
    [ProducesBadRequestProblem]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    public async Task<IActionResult> Patch(
        Guid orderId,
        [FromBody] UpdateOrderRequest request,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<UpdateOrderCommand, UpdateOrderResult>(
            request.ToCommand(orderId, RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpDelete("{orderId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.CustomerOrAdmin)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesForbiddenProblem]
    [ProducesConflictProblem]
    public async Task<IActionResult> Delete(Guid orderId, CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<DeleteOrderCommand, DeleteOrderResult>(
            orderId.ToDeleteOrderCommand(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }
}
