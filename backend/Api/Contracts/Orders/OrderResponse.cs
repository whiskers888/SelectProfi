using System.Text.Json.Serialization;

namespace SelectProfi.backend.Contracts.Orders;

public sealed class OrderResponse
{
    public Guid Id { get; init; }

    public bool IsFavorite { get; init; }

    public OrderExecutorResponseStatusContract? MyResponseStatus { get; init; }

    public string? MyResponseMessage { get; init; }

    public Guid CustomerId { get; init; }

    public Guid? ExecutorId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public string Location { get; init; } = string.Empty;

    public string EmployeeCompensation { get; init; } = string.Empty;

    public string? WorkMode { get; init; }
    public decimal? SalaryMin { get; init; }
    public decimal? SalaryMax { get; init; }
    public int? FulfillmentDays { get; init; }
    public int? WarrantyMonths { get; init; }
    public decimal? GuaranteeReward { get; init; }

    public string Functional { get; init; } = string.Empty;

    public string Requirements { get; init; } = string.Empty;

    public string OtherConditions { get; init; } = string.Empty;

    // @dvnull: Ранее specialization хранилась внутри description; добавлено отдельное поле ответа API.
    public string Specialization { get; init; } = string.Empty;

    // @dvnull: Ранее response не содержал FK на dictionary специализации; добавлен specializationId.
    public Guid? SpecializationId { get; init; }

    // @dvnull: Ранее цена заказа не возвращалась отдельным атрибутом; добавлено поле price.
    public decimal Price { get; init; }

    public decimal GrossAmount => Price;

    public decimal ServiceCommissionPercent => ServiceCommissionRate * 100m;

    public decimal ServiceCommissionAmount =>
        Math.Round(Price * ServiceCommissionRate, 2, MidpointRounding.AwayFromZero);

    public decimal ExecutorNetAmount =>
        Math.Round(Price - ServiceCommissionAmount, 2, MidpointRounding.AwayFromZero);

    public bool IsPricingLocked => ExecutorId.HasValue;

    [JsonIgnore]
    public decimal ServiceCommissionRate { get; init; }

    public string? CustomerCompanyName { get; init; }

    public int RequestedCandidatesCount { get; init; }

    public OrderStatusContract Status { get; init; } = OrderStatusContract.Active;

    public DateOnly? DueDate { get; init; }

    public DateTime? CompletedAtUtc { get; init; }

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }

    public DateTime? DeletedAtUtc { get; init; }
}
