using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Application.Vacancies.UpdateVacancyStatus;

public sealed class UpdateVacancyStatusCommand : ICommand<UpdateVacancyStatusResult>
{
    public Guid VacancyId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }

    public VacancyStatus Status { get; init; } = VacancyStatus.Draft;
}
