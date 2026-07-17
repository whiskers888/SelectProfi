using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Candidates.GetMyCandidates;

public sealed class GetMyCandidatesQuery : IQuery<GetMyCandidatesResult>
{
    public Guid RequesterUserId { get; init; }
}
