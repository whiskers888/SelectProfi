using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Vacancies.CreateVacancy;

public sealed class CreateVacancyCommand : ICommand<CreateVacancyResult>
{
    public Guid OrderId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }

    public string Title { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;
}
