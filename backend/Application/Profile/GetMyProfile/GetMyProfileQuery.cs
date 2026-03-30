using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Profile.GetMyProfile;

public sealed class GetMyProfileQuery : IQuery<GetMyProfileResult>
{
    public Guid UserId { get; init; }
}
