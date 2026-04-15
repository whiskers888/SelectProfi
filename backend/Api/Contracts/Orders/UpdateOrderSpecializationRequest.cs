using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Orders;

public sealed class UpdateOrderSpecializationRequest : IValidatableObject
{
    [MinLength(1)]
    [MaxLength(200)]
    public string? Name { get; init; }

    public bool? IsActive { get; init; }

    public int? SortOrder { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Name is null && IsActive is null && SortOrder is null)
        {
            yield return new ValidationResult(
                "At least one field (name, isActive or sortOrder) is required.",
                [nameof(Name), nameof(IsActive), nameof(SortOrder)]);
        }
    }
}
