using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Vacancies.UpdateVacancy;

public sealed class UpdateVacancyCommand : ICommand<UpdateVacancyResult>
{
    public Guid VacancyId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }

    public string? Title { get; init; }

    public string? Description { get; init; }
}
