using Microsoft.Extensions.Options;
using SelectProfi.backend.Application.Orders.GetMyOrderResponse;
using SelectProfi.backend.Application.Orders.SelectOrderResponseExecutor;
using SelectProfi.backend.Application.Orders.UpdateOrder;
using SelectProfi.backend.Configuration;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Mappings;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class OrderPricingRulesTests
{
    [Fact]
    public void Response_SeparatesGrossCommissionAndExecutorNetAmount()
    {
        var result = new SelectProfi.backend.Application.Orders.GetOrderById.GetOrderByIdResult
        {
            OrderId = Guid.NewGuid(),
            CustomerId = Guid.NewGuid(),
            ExecutorId = Guid.NewGuid(),
            Price = 100000m,
            ServiceCommissionRate = 0.15m
        };

        var response = result.ToResponse(
            UserRole.Executor,
            Options.Create(new OrderPricingOptions { ServiceCommissionPercent = 0.25m }).Value);

        Assert.Equal(100000m, response.Price);
        Assert.Equal(100000m, response.GrossAmount);
        Assert.Equal(15m, response.ServiceCommissionPercent);
        Assert.Equal(15000m, response.ServiceCommissionAmount);
        Assert.Equal(85000m, response.ExecutorNetAmount);
        Assert.True(response.IsPricingLocked);
    }

    [Fact]
    public async Task SelectExecutor_RejectsOrderWithoutPrice()
    {
        var order = CreateOrder(price: 0m);
        var executorId = Guid.NewGuid();
        var persistence = new SelectExecutorPersistence(
            order,
            [CreatePendingResponse(order.Id, executorId)]);
        var handler = new SelectOrderResponseExecutorCommandHandler(persistence);

        var result = await handler.HandleAsync(
            CreateSelectCommand(order, executorId),
            CancellationToken.None);

        Assert.Equal(SelectOrderResponseExecutorErrorCode.PriceRequired, result.ErrorCode);
        Assert.Null(order.ExecutorId);
        Assert.Null(order.ServiceCommissionRate);
        Assert.Equal(0, persistence.SaveCount);
    }

    [Fact]
    public async Task SelectExecutor_LocksCurrentCommissionRate()
    {
        var order = CreateOrder(price: 100000m);
        var executorId = Guid.NewGuid();
        var persistence = new SelectExecutorPersistence(
            order,
            [CreatePendingResponse(order.Id, executorId)]);
        var handler = new SelectOrderResponseExecutorCommandHandler(persistence);

        var result = await handler.HandleAsync(
            CreateSelectCommand(order, executorId),
            CancellationToken.None);

        Assert.Equal(SelectOrderResponseExecutorErrorCode.None, result.ErrorCode);
        Assert.Equal(executorId, order.ExecutorId);
        Assert.Equal(0.15m, order.ServiceCommissionRate);
        Assert.Equal(1, persistence.SaveCount);
    }

    [Fact]
    public async Task Customer_CannotChangePriceAfterExecutorAssignment()
    {
        var order = CreateOrder(price: 100000m);
        order.ExecutorId = Guid.NewGuid();
        order.ServiceCommissionRate = 0.15m;
        var persistence = new UpdateOrderPersistence(order);
        var handler = new UpdateOrderCommandHandler(persistence);

        var result = await handler.HandleAsync(
            new UpdateOrderCommand
            {
                OrderId = order.Id,
                RequesterUserId = order.CustomerId,
                RequesterRole = UserRole.Customer,
                Price = 120000m,
                ServiceCommissionRate = 0.15m
            },
            CancellationToken.None);

        Assert.Equal(UpdateOrderErrorCode.PriceLocked, result.ErrorCode);
        Assert.Equal(100000m, order.Price);
        Assert.Equal(0, persistence.SaveCount);
    }

    [Fact]
    public async Task Executor_CanReadOwnResponseAfterOrderIsAssignedToAnotherExecutor()
    {
        var order = CreateOrder(price: 100000m);
        order.ExecutorId = Guid.NewGuid();
        var requesterId = Guid.NewGuid();
        var response = new OrderExecutorResponse
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            ExecutorId = requesterId,
            Status = OrderResponseStatus.Rejected,
            Message = "Подберу кандидатов с опытом в отрасли.",
            UpdatedAtUtc = DateTime.UtcNow
        };
        var handler = new GetMyOrderResponseQueryHandler(new GetMyOrderResponsePersistence(order, response));

        var result = await handler.HandleAsync(new GetMyOrderResponseQuery
        {
            OrderId = order.Id,
            RequesterUserId = requesterId,
            RequesterRole = UserRole.Executor
        }, CancellationToken.None);

        Assert.Equal(GetMyOrderResponseErrorCode.None, result.ErrorCode);
        Assert.True(result.HasResponse);
        Assert.Equal(OrderResponseStatus.Rejected, result.Status);
        Assert.Equal(response.Message, result.Message);
    }

    [Fact]
    public async Task Executor_CannotReadAssignedOrderWithoutOwnResponse()
    {
        var order = CreateOrder(price: 100000m);
        order.ExecutorId = Guid.NewGuid();
        var handler = new GetMyOrderResponseQueryHandler(new GetMyOrderResponsePersistence(order, null));

        var result = await handler.HandleAsync(new GetMyOrderResponseQuery
        {
            OrderId = order.Id,
            RequesterUserId = Guid.NewGuid(),
            RequesterRole = UserRole.Executor
        }, CancellationToken.None);

        Assert.Equal(GetMyOrderResponseErrorCode.Forbidden, result.ErrorCode);
    }

    private static Order CreateOrder(decimal price)
    {
        return new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = Guid.NewGuid(),
            Price = price,
            Status = OrderStatus.Active
        };
    }

    private static OrderExecutorResponse CreatePendingResponse(Guid orderId, Guid executorId)
    {
        return new OrderExecutorResponse
        {
            OrderId = orderId,
            ExecutorId = executorId,
            Status = OrderResponseStatus.Pending
        };
    }

    private static SelectOrderResponseExecutorCommand CreateSelectCommand(Order order, Guid executorId)
    {
        return new SelectOrderResponseExecutorCommand
        {
            OrderId = order.Id,
            ExecutorId = executorId,
            RequesterUserId = order.CustomerId,
            RequesterRole = UserRole.Customer,
            ServiceCommissionRate = 0.15m
        };
    }

    private sealed class SelectExecutorPersistence(
        Order order,
        IReadOnlyList<OrderExecutorResponse> responses) : ISelectOrderResponseExecutorPersistence
    {
        public int SaveCount { get; private set; }

        public Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken)
        {
            return Task.FromResult<Order?>(order.Id == orderId ? order : null);
        }

        public Task<IReadOnlyList<OrderExecutorResponse>> FindOrderResponsesAsync(
            Guid orderId,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(responses);
        }

        public Task<SelectOrderResponseExecutorPersistenceResult> SaveChangesAsync(
            CancellationToken cancellationToken)
        {
            SaveCount++;
            return Task.FromResult(SelectOrderResponseExecutorPersistenceResult.Saved);
        }
    }

    private sealed class UpdateOrderPersistence(Order order) : IUpdateOrderPersistence
    {
        public int SaveCount { get; private set; }

        public Task<Order?> FindByIdAsync(Guid orderId, CancellationToken cancellationToken)
        {
            return Task.FromResult<Order?>(order.Id == orderId ? order : null);
        }

        public Task<UpdateOrderSpecializationSnapshot?> FindActiveSpecializationByIdAsync(
            Guid specializationId,
            CancellationToken cancellationToken)
        {
            return Task.FromResult<UpdateOrderSpecializationSnapshot?>(null);
        }

        public Task<bool> ExecutorExistsAsync(Guid executorId, CancellationToken cancellationToken)
        {
            return Task.FromResult(true);
        }

        public Task<UpdateOrderPersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveCount++;
            return Task.FromResult(UpdateOrderPersistenceResult.Saved);
        }
    }

    private sealed class GetMyOrderResponsePersistence(Order order, OrderExecutorResponse? response)
        : IGetMyOrderResponsePersistence
    {
        public Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken)
        {
            return Task.FromResult<Order?>(order.Id == orderId ? order : null);
        }

        public Task<OrderExecutorResponse?> FindExecutorResponseAsync(
            Guid orderId,
            Guid executorId,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(response?.OrderId == orderId && response.ExecutorId == executorId ? response : null);
        }
    }
}
