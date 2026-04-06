using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.UpdateVacancyCandidateStage;

public sealed class UpdateVacancyCandidateStageCommand : ICommand<UpdateVacancyCandidateStageResult>
{
    public Guid VacancyId { get; init; }

    public Guid CandidateId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }

    public VacancyCandidateStage Stage { get; init; } = VacancyCandidateStage.Pool;
}
