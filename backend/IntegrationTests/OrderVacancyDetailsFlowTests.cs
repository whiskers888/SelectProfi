using Microsoft.Extensions.Options;
using SelectProfi.backend.Application.Orders.CreateOrder;
using SelectProfi.backend.Contracts.Orders;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Mappings;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class OrderVacancyDetailsFlowTests
{
    [Fact]
    public async Task CreateFlow_MapsPersistsAndReturnsStructuredVacancyDetails()
    {
        var customerId = Guid.NewGuid();
        var specializationId = Guid.NewGuid();
        var persistence = new CapturingCreateOrderPersistence(customerId, specializationId);
        var handler = new CreateOrderCommandHandler(
            persistence,
            Options.Create(new OrderCandidateRequirementsOptions
            {
                MinRequestedCandidatesCount = 1
            }));
        var request = new CreateOrderRequest
        {
            Title = "Senior React Developer",
            Description = "Structured vacancy details",
            SpecializationId = specializationId,
            Price = 500000m,
            RequestedCandidatesCount = 3,
            Location = "Москва / удалённо",
            EmployeeCompensation = "200 000–250 000 ₽ net",
            Functional = "Разработка продукта",
            Requirements = "React и TypeScript",
            OtherConditions = "ДМС и техника"
        };

        var result = await handler.HandleAsync(
            request.ToCommand(customerId),
            CancellationToken.None);
        var response = result.ToResponse();

        Assert.Equal(CreateOrderErrorCode.None, result.ErrorCode);
        Assert.NotNull(persistence.CreatedOrder);
        Assert.Equal(request.Location, persistence.CreatedOrder!.Location);
        Assert.Equal(request.EmployeeCompensation, persistence.CreatedOrder.EmployeeCompensation);
        Assert.Equal(request.Functional, persistence.CreatedOrder.Functional);
        Assert.Equal(request.Requirements, persistence.CreatedOrder.Requirements);
        Assert.Equal(request.OtherConditions, persistence.CreatedOrder.OtherConditions);
        Assert.Equal("Integration Company", response.CustomerCompanyName);
        Assert.Equal(request.Location, response.Location);
        Assert.Equal(request.EmployeeCompensation, response.EmployeeCompensation);
        Assert.Equal(request.Functional, response.Functional);
        Assert.Equal(request.Requirements, response.Requirements);
        Assert.Equal(request.OtherConditions, response.OtherConditions);
        Assert.Equal(request.Price, response.GrossAmount);
        Assert.Equal(15m, response.ServiceCommissionPercent);
        Assert.Equal(75000m, response.ServiceCommissionAmount);
        Assert.Equal(425000m, response.ExecutorNetAmount);
    }

    private sealed class CapturingCreateOrderPersistence(
        Guid customerId,
        Guid specializationId) : ICreateOrderPersistence
    {
        public Order? CreatedOrder { get; private set; }

        public Task<CreateOrderCustomerSnapshot?> FindCustomerSnapshotAsync(
            Guid requestedCustomerId,
            CancellationToken cancellationToken)
        {
            return Task.FromResult<CreateOrderCustomerSnapshot?>(
                requestedCustomerId == customerId
                    ? new CreateOrderCustomerSnapshot
                    {
                        CustomerId = customerId,
                        CompanyName = "Integration Company"
                    }
                    : null);
        }

        public Task<CreateOrderSpecializationSnapshot?> FindActiveSpecializationByIdAsync(
            Guid requestedSpecializationId,
            CancellationToken cancellationToken)
        {
            return Task.FromResult<CreateOrderSpecializationSnapshot?>(
                requestedSpecializationId == specializationId
                    ? new CreateOrderSpecializationSnapshot
                    {
                        SpecializationId = specializationId,
                        Name = "Frontend"
                    }
                    : null);
        }

        public Task<CreateOrderPersistenceResult> CreateAsync(
            Order order,
            CancellationToken cancellationToken)
        {
            CreatedOrder = order;
            return Task.FromResult(CreateOrderPersistenceResult.Created);
        }
    }
}
