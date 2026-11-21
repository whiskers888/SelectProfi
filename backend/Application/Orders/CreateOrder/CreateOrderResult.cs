namespace SelectProfi.backend.Application.Orders.CreateOrder;

using SelectProfi.backend.Domain.Orders;

public sealed class CreateOrderResult
{
    public CreateOrderErrorCode ErrorCode { get; init; } = CreateOrderErrorCode.None;

    public Guid OrderId { get; init; }

    public Guid CustomerId { get; init; }

    public Guid? ExecutorId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public string Location { get; init; } = string.Empty;

    public string EmployeeCompensation { get; init; } = string.Empty;

    public string Functional { get; init; } = string.Empty;

    public string Requirements { get; init; } = string.Empty;

    public string OtherConditions { get; init; } = string.Empty;

    public string Specialization { get; init; } = string.Empty;

    // @dvnull: Ранее create-result не возвращал specializationId; добавлено поле для фронтовой привязки к словарю.
    public Guid? SpecializationId { get; init; }

    public decimal Price { get; init; }

    public decimal? ServiceCommissionRate { get; init; }

    public string? CustomerCompanyName { get; init; }

    public int RequestedCandidatesCount { get; init; }

    public OrderStatus Status { get; init; } = OrderStatus.Active;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }

    public DateOnly? DueDate { get; init; }

    public DateTime? CompletedAtUtc { get; init; }
}
