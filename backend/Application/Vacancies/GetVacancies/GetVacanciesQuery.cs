using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Vacancies.GetVacancies;

public sealed class GetVacanciesQuery : IQuery<GetVacanciesResult>
{
    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }

    public int Limit { get; init; }

    public int Offset { get; init; }
}
