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

    // @dvnull: Добавлен lifecycle-статус заказа для операций "На паузу/Активировать" без удаления сущности.
    public OrderStatus Status { get; set; } = OrderStatus.Active;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public DateTime? DeletedAtUtc { get; set; }
}
