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
            Specialization is null &&
            SpecializationId is null &&
            Price is null &&
            ExecutorId is null &&
            Status is null)
        {
            yield return new ValidationResult(
                "At least one field (title, description, specialization, specializationId, price, executorId or status) is required.",
                [nameof(Title), nameof(Description), nameof(Specialization), nameof(SpecializationId), nameof(Price), nameof(ExecutorId), nameof(Status)]);
        }
    }
}
