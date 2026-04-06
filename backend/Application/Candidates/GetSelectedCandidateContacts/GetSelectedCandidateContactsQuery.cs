using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.GetSelectedCandidateContacts;

public sealed class GetSelectedCandidateContactsQuery : IQuery<GetSelectedCandidateContactsResult>
{
    public Guid VacancyId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
