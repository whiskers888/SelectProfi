namespace SelectProfi.backend.Application.Profile.GetMyProfile;

public interface IGetMyProfileUseCase
{
    Task<GetMyProfileResult> ExecuteAsync(GetMyProfileQuery query, CancellationToken cancellationToken);
}
