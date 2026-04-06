using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;

public sealed class GetVacancyCandidateContactsForExecutorQuery
    : IQuery<GetVacancyCandidateContactsForExecutorResult>
{
    public Guid VacancyId { get; init; }

    public Guid CandidateId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
