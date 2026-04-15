using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Domain.Orders;

public sealed class Order
{
    // @dvnull: Базовые ограничения полей перенесены из Fluent-конфигурации в DataAnnotations для читаемости модели.
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; }

    public Guid CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    public Guid? ExecutorId { get; set; }

    [ForeignKey(nameof(ExecutorId))]
    public User? Executor { get; set; }

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    // @dvnull: Ранее у заказа не было внешнего ключа на справочник специализаций; добавлена nullable-ссылка на dictionary-элемент.
    public Guid? SpecializationId { get; set; }

    [ForeignKey(nameof(SpecializationId))]
    public OrderSpecialization? SpecializationDictionaryItem { get; set; }

    // @dvnull: Ранее специализация заказа сохранялась внутри description; вынесена в отдельное поле для фильтрации и аналитики.
    [MaxLength(200)]
    public string Specialization { get; set; } = string.Empty;

    // @dvnull: Ранее цена заказа не имела отдельной колонки; добавлено числовое поле для явного бюджетного атрибута.
    public decimal Price { get; set; }

    [MaxLength(255)]
    public string? CustomerCompanyName { get; set; }

    // @dvnull: Ранее модель заказа не хранила целевое число кандидатов; добавлено поле для контроля shortlist-обязательств.
    public int RequestedCandidatesCount { get; set; } = 3;

    // @dvnull: Добавлен lifecycle-статус заказа для операций "На паузу/Активировать" без удаления сущности.
    public OrderStatus Status { get; set; } = OrderStatus.Active;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public DateTime? DeletedAtUtc { get; set; }
}
