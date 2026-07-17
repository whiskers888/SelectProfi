namespace SelectProfi.backend.Application.Candidates.GetMyCandidates;

public interface IGetMyCandidatesPersistence
{
    Task<IReadOnlyList<GetMyCandidatesItemResult>> FindByOwnerAsync(Guid executorUserId, CancellationToken cancellationToken);
}
