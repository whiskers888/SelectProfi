namespace SelectProfi.backend.Application.Candidates.MarkVacancyCandidateViewedByCustomer;

public sealed class MarkVacancyCandidateViewedByCustomerResult
{
    public MarkVacancyCandidateViewedByCustomerErrorCode ErrorCode { get; init; } =
        MarkVacancyCandidateViewedByCustomerErrorCode.None;
}
