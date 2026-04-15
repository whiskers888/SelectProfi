using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Orders.CreateOrder;

public sealed class CreateOrderCommand : ICommand<CreateOrderResult>
{
    public Guid CustomerId { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public string Specialization { get; init; } = string.Empty;

    // @dvnull: Ранее create-command не поддерживал dictionary-ссылку specializationId; добавлено поле для справочника специализаций.
    public Guid? SpecializationId { get; init; }

    public decimal Price { get; init; }

    public int RequestedCandidatesCount { get; init; }
}
