using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Candidates.GetMyCandidates;

public sealed class GetMyCandidatesQueryHandler(IGetMyCandidatesPersistence persistence)
    : IQueryHandler<GetMyCandidatesQuery, GetMyCandidatesResult>
{
    public async Task<GetMyCandidatesResult> HandleAsync(GetMyCandidatesQuery query, CancellationToken cancellationToken) =>
        new() { Items = await persistence.FindByOwnerAsync(query.RequesterUserId, cancellationToken) };
}
