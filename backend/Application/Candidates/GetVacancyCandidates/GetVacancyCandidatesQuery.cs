using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.GetVacancyCandidates;

public sealed class GetVacancyCandidatesQuery : IQuery<GetVacancyCandidatesResult>
{
    public Guid VacancyId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
