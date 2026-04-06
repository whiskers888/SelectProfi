namespace SelectProfi.backend.Application.Candidates.GetVacancyCandidateContactsForExecutor;

public sealed class GetVacancyCandidateContactsForExecutorResult
{
    public GetVacancyCandidateContactsForExecutorErrorCode ErrorCode { get; init; } =
        GetVacancyCandidateContactsForExecutorErrorCode.None;

    public Guid VacancyId { get; init; }

    public Guid CandidateId { get; init; }

    public string FullName { get; init; } = string.Empty;

    public string? Email { get; init; }

    public string? Phone { get; init; }

    public DateTime ContactsAccessExpiresAtUtc { get; init; }
}
