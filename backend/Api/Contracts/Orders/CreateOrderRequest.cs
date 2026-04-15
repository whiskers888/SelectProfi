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

    [MaxLength(200)]
    // @dvnull: Ранее specialization передавалась внутри description; добавлено отдельное поле контракта create-order.
    public string? Specialization { get; init; }

    // @dvnull: Ранее create-order не поддерживал связь со справочником специализаций; добавлен specializationId.
    public Guid? SpecializationId { get; init; }

    // @dvnull: Ранее цена заказа не имела отдельного поля в API; добавлена decimal-цена заказа. Поле сделано nullable для backward-compatible create.
    public decimal? Price { get; init; }

    [Range(1, int.MaxValue)]
    // @dvnull: Ранее заказ не содержал параметр требуемого количества кандидатов; добавлено поле для явного запроса заказчика.
    public int RequestedCandidatesCount { get; init; }
}
