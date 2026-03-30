namespace SelectProfi.backend.Application.Profile.UpdateMyProfile;

public interface IUpdateMyProfileUseCase
{
    Task<UpdateMyProfileResult> ExecuteAsync(UpdateMyProfileCommand command, CancellationToken cancellationToken);
}
