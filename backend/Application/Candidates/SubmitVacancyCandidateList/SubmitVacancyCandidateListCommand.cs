using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.SubmitVacancyCandidateList;

public sealed class SubmitVacancyCandidateListCommand : ICommand<SubmitVacancyCandidateListResult>
{
    public Guid VacancyId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
