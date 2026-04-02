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

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Title is null && Description is null)
        {
            yield return new ValidationResult(
                "At least one field (title or description) is required.",
                [nameof(Title), nameof(Description)]);
        }
    }
}
