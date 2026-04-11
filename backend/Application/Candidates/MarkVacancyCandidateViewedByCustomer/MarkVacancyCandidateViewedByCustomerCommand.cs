using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.MarkVacancyCandidateViewedByCustomer;

public sealed class MarkVacancyCandidateViewedByCustomerCommand
    : ICommand<MarkVacancyCandidateViewedByCustomerResult>
{
    public Guid VacancyId { get; init; }

    public Guid CandidateId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }
}
