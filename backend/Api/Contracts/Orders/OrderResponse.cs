namespace SelectProfi.backend.Contracts.Orders;

public sealed class OrderResponse
{
    public Guid Id { get; init; }

    public Guid CustomerId { get; init; }

    public Guid? ExecutorId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    // @dvnull: Ранее specialization хранилась внутри description; добавлено отдельное поле ответа API.
    public string Specialization { get; init; } = string.Empty;

    // @dvnull: Ранее response не содержал FK на dictionary специализации; добавлен specializationId.
    public Guid? SpecializationId { get; init; }

    // @dvnull: Ранее цена заказа не возвращалась отдельным атрибутом; добавлено поле price.
    public decimal Price { get; init; }

    public string? CustomerCompanyName { get; init; }

    public int RequestedCandidatesCount { get; init; }

    public OrderStatusContract Status { get; init; } = OrderStatusContract.Active;

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }

    public DateTime? DeletedAtUtc { get; init; }
}
