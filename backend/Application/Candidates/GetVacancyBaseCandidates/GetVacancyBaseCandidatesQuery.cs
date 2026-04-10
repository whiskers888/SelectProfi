using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.GetVacancyBaseCandidates;

public sealed class GetVacancyBaseCandidatesQuery : IQuery<GetVacancyBaseCandidatesResult>
{
    public Guid VacancyId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
