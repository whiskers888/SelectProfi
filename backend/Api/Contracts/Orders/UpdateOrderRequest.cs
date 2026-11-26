using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Orders;

public sealed class UpdateOrderRequest : IValidatableObject
{
    [MinLength(1)]
    [MaxLength(200)]
    public string? Title { get; init; }

    [MinLength(1)]
    [MaxLength(4000)]
    public string? Description { get; init; }

    [MaxLength(255)]
    public string? Location { get; init; }

    [MaxLength(255)]
    public string? EmployeeCompensation { get; init; }

    [RegularExpression("^(Remote|Office|Hybrid)$")]
    public string? WorkMode { get; init; }
    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? SalaryMin { get; init; }
    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? SalaryMax { get; init; }
    [Range(1, int.MaxValue)]
    public int? FulfillmentDays { get; init; }
    [Range(0, int.MaxValue)]
    public int? WarrantyMonths { get; init; }
    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? GuaranteeReward { get; init; }

    [MaxLength(4000)]
    public string? Functional { get; init; }

    [MaxLength(4000)]
    public string? Requirements { get; init; }

    [MaxLength(4000)]
    public string? OtherConditions { get; init; }

    [MinLength(1)]
    [MaxLength(200)]
    // @dvnull: Ранее PATCH не поддерживал отдельную специализацию заказа; добавлено частичное обновление specialization.
    public string? Specialization { get; init; }

    // @dvnull: Ранее PATCH не поддерживал связь заказа со справочником специализаций; добавлен specializationId.
    public Guid? SpecializationId { get; init; }

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    // @dvnull: Ранее PATCH не поддерживал отдельное поле цены; добавлено частичное обновление price.
    public decimal? Price { get; init; }

    public Guid? ExecutorId { get; init; }

    public OrderStatusContract? Status { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Title is null &&
            Description is null &&
            Location is null &&
            EmployeeCompensation is null &&
            WorkMode is null && SalaryMin is null && SalaryMax is null && FulfillmentDays is null && WarrantyMonths is null && GuaranteeReward is null &&
            Functional is null &&
            Requirements is null &&
            OtherConditions is null &&
            Specialization is null &&
            SpecializationId is null &&
            Price is null &&
            ExecutorId is null &&
            Status is null)
        {
            yield return new ValidationResult(
                "At least one order field is required.",
                [nameof(Title), nameof(Description), nameof(Location), nameof(EmployeeCompensation), nameof(Functional), nameof(Requirements), nameof(OtherConditions), nameof(Specialization), nameof(SpecializationId), nameof(Price), nameof(ExecutorId), nameof(Status)]);
        }
    }
}
