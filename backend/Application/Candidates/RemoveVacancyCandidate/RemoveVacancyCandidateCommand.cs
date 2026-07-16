using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.RemoveVacancyCandidate;

public sealed class RemoveVacancyCandidateCommand : ICommand<RemoveVacancyCandidateResult>
{
    public Guid VacancyId { get; init; }
    public Guid CandidateId { get; init; }
    public Guid RequesterUserId { get; init; }
    public UserRole RequesterRole { get; init; }
}
