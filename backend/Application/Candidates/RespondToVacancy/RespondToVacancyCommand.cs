using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.RespondToVacancy;

public sealed class RespondToVacancyCommand : ICommand<RespondToVacancyResult>
{
    public Guid VacancyId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}

