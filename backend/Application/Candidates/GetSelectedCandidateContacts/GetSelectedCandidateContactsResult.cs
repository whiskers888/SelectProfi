namespace SelectProfi.backend.Application.Candidates.GetSelectedCandidateContacts;

public sealed class GetSelectedCandidateContactsResult
{
    public GetSelectedCandidateContactsErrorCode ErrorCode { get; init; } =
        GetSelectedCandidateContactsErrorCode.None;

    public Guid VacancyId { get; init; }

    public Guid CandidateId { get; init; }

    public string FullName { get; init; } = string.Empty;

    public string? Email { get; init; }

    public string? Phone { get; init; }
}
