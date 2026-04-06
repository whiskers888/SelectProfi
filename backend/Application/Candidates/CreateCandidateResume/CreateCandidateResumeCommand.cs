using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.CreateCandidateResume;

public sealed class CreateCandidateResumeCommand : ICommand<CreateCandidateResumeResult>
{
    public Guid VacancyId { get; init; }

    public Guid RequesterUserId { get; init; }

    public UserRole RequesterRole { get; init; }

    public string FullName { get; init; } = string.Empty;

    public DateOnly? BirthDate { get; init; }

    public string? Email { get; init; }

    public string? Phone { get; init; }

    public string Specialization { get; init; } = string.Empty;

    public string ResumeTitle { get; init; } = string.Empty;

    public string ResumeContentJson { get; init; } = "{}";

    public string? ResumeAttachmentsJson { get; init; }
}
