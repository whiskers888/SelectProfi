using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Orders;

public sealed class CreateOrderRequest
{
    [Required]
    [MinLength(1)]
    [MaxLength(200)]
    public string Title { get; init; } = string.Empty;

    [Required]
    [MinLength(1)]
    [MaxLength(4000)]
    public string Description { get; init; } = string.Empty;

    [Range(1, int.MaxValue)]
    // @dvnull: Ранее заказ не содержал параметр требуемого количества кандидатов; добавлено поле для явного запроса заказчика.
    public int RequestedCandidatesCount { get; init; }
}
