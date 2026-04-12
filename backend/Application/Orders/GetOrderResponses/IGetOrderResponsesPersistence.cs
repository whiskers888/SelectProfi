using SelectProfi.backend.Domain.Orders;

namespace SelectProfi.backend.Application.Orders.GetOrderResponses;

public interface IGetOrderResponsesPersistence
{
    Task<Order?> FindOrderByIdAsync(Guid orderId, CancellationToken cancellationToken);

    Task<IReadOnlyList<GetOrderResponsesItemSnapshot>> FindByOrderIdAsync(Guid orderId, CancellationToken cancellationToken);
}

public sealed class GetOrderResponsesItemSnapshot
{
    public Guid ExecutorId { get; init; }

    public string ExecutorFullName { get; init; } = string.Empty;

    public string? ExecutorGrade { get; init; }

    public string? ExecutorProjectTitle { get; init; }

    public string? ExecutorProjectCompanyName { get; init; }

    public string? ExecutorExperienceSummary { get; init; }

    public OrderResponseStatus Status { get; init; } = OrderResponseStatus.Pending;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
