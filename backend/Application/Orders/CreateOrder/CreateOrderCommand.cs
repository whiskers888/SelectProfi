using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Orders.CreateOrder;

public sealed class CreateOrderCommand : ICommand<CreateOrderResult>
{
    public Guid CustomerId { get; init; }

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

    public string Specialization { get; init; } = string.Empty;

    // @dvnull: Ранее create-command не поддерживал dictionary-ссылку specializationId; добавлено поле для справочника специализаций.
    public Guid? SpecializationId { get; init; }

    public decimal Price { get; init; }

    public int RequestedCandidatesCount { get; init; }
}
