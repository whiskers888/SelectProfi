using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Orders;

public sealed class CreateOrderSpecializationRequest
{
    [Required]
    [MinLength(1)]
    [MaxLength(200)]
    public string Name { get; init; } = string.Empty;

    public int SortOrder { get; init; }
}
