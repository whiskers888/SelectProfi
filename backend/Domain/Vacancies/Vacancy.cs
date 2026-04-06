using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Domain.Vacancies;

public sealed class Vacancy
{
    // @dvnull: Базовые ограничения полей перенесены из Fluent-конфигурации в DataAnnotations для читаемости модели.
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public Guid Id { get; set; }

    public Guid OrderId { get; set; }

    [ForeignKey(nameof(OrderId))]
    public Order Order { get; set; } = null!;

    public Guid CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    public Guid ExecutorId { get; set; }

    [ForeignKey(nameof(ExecutorId))]
    public User Executor { get; set; } = null!;

    // @dvnull: Ранее у вакансии не было явного финального выбора кандидата; добавлен SelectedCandidateId под модель "2 списка + 1 выбор".
    public Guid? SelectedCandidateId { get; set; }

    [ForeignKey(nameof(SelectedCandidateId))]
    public Candidate? SelectedCandidate { get; set; }

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    // @dvnull: Добавлен статус жизненного цикла вакансии для процесса согласования и публикации.
    public VacancyStatus Status { get; set; } = VacancyStatus.Draft;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public DateTime? DeletedAtUtc { get; set; }

    public ICollection<VacancyCandidate> VacancyCandidates { get; set; } = new List<VacancyCandidate>();
}
