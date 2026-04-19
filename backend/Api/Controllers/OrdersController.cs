using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SelectProfi.backend.Authentication;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Application.Orders.DeleteOrder;
using SelectProfi.backend.Application.Orders.GetOrderById;
using SelectProfi.backend.Application.Orders.GetOrderExecutors;
using SelectProfi.backend.Application.Orders.GetMyOrderResponse;
using SelectProfi.backend.Application.Orders.GetMyOrders;
using SelectProfi.backend.Application.Orders.GetOrders;
using SelectProfi.backend.Application.Orders.GetOrderResponses;
using SelectProfi.backend.Application.Orders.RejectOrderResponse;
using SelectProfi.backend.Application.Orders.RespondToOrder;
using SelectProfi.backend.Application.Orders.SelectOrderResponseExecutor;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Application.Orders.WithdrawOrderResponse;
using SelectProfi.backend.Configuration;
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
    IQueryDispatcher queryDispatcher,
    IOptions<OrderPricingOptions> orderPricingOptions) : AuthorizedControllerBase
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

        return result.ToActionResult(this, RequesterRole, orderPricingOptions.Value);
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

        return result.ToActionResult(this, RequesterRole, orderPricingOptions.Value);
    }

    [HttpGet("my")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(OrderListResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    [ProducesBadRequestProblem]
    public async Task<IActionResult> GetMyList(
        [FromQuery] GetOrdersRequest request,
        CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetMyOrdersQuery, GetOrdersResult>(
            request.ToMyOrdersQuery(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this, RequesterRole, orderPricingOptions.Value);
    }

    [HttpGet("executors")]
    [Authorize(Policy = AuthorizationPolicies.CustomerOrAdmin)]
    [ProducesResponseType(typeof(OrderExecutorListResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    public async Task<IActionResult> GetExecutors(CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetOrderExecutorsQuery, GetOrderExecutorsResult>(
            OrderRequestMapper.ToQuery(RequesterUserId, RequesterRole),
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

    [HttpPost("{orderId:guid}/respond")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(OrderExecutorResponseItemResponse), StatusCodes.Status201Created)]
    [ProducesForbiddenProblem]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Respond(Guid orderId, CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<RespondToOrderCommand, RespondToOrderResult>(
            orderId.ToRespondToOrderCommand(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpDelete("{orderId:guid}/respond")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(OrderExecutorResponseItemResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> WithdrawResponse(Guid orderId, CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<WithdrawOrderResponseCommand, WithdrawOrderResponseResult>(
            orderId.ToWithdrawOrderResponseCommand(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpGet("{orderId:guid}/responses")]
    [Authorize(Policy = AuthorizationPolicies.CustomerOrAdmin)]
    [ProducesResponseType(typeof(OrderExecutorResponsesResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    public async Task<IActionResult> GetResponses(Guid orderId, CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetOrderResponsesQuery, GetOrderResponsesResult>(
            orderId.ToGetOrderResponsesQuery(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpGet("{orderId:guid}/my-response")]
    [Authorize(Policy = AuthorizationPolicies.ExecutorOnly)]
    [ProducesResponseType(typeof(MyOrderResponseResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    public async Task<IActionResult> GetMyResponse(Guid orderId, CancellationToken cancellationToken)
    {
        var result = await queryDispatcher.DispatchAsync<GetMyOrderResponseQuery, GetMyOrderResponseResult>(
            orderId.ToGetMyOrderResponseQuery(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpPost("{orderId:guid}/responses/{executorId:guid}/select")]
    [Authorize(Policy = AuthorizationPolicies.CustomerOrAdmin)]
    [ProducesResponseType(typeof(SelectOrderResponseExecutorResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SelectResponseExecutor(
        Guid orderId,
        Guid executorId,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<SelectOrderResponseExecutorCommand, SelectOrderResponseExecutorResult>(
            (orderId, executorId).ToSelectOrderResponseExecutorCommand(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }

    [HttpPost("{orderId:guid}/responses/{executorId:guid}/reject")]
    [Authorize(Policy = AuthorizationPolicies.CustomerOrAdmin)]
    [ProducesResponseType(typeof(OrderExecutorResponseItemResponse), StatusCodes.Status200OK)]
    [ProducesForbiddenProblem]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RejectResponseExecutor(
        Guid orderId,
        Guid executorId,
        CancellationToken cancellationToken)
    {
        var result = await commandDispatcher.DispatchAsync<RejectOrderResponseCommand, RejectOrderResponseResult>(
            (orderId, executorId).ToRejectOrderResponseCommand(RequesterUserId, RequesterRole),
            cancellationToken);

        return result.ToActionResult(this);
    }
}
