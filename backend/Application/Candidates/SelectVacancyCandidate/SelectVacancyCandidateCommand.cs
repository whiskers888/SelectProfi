using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.SelectVacancyCandidate;

public sealed class SelectVacancyCandidateCommand : ICommand<SelectVacancyCandidateResult>
{
    public Guid VacancyId { get; init; }

    public Guid CandidateId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
