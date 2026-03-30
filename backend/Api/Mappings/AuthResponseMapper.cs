using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Contracts.Auth;

namespace SelectProfi.backend.Mappings;

public static class AuthResponseMapper
{
    public static RegisterUserResponse ToResponse(this RegisterUserResult result)
    {
        return new RegisterUserResponse
        {
            AccessToken = result.AccessToken,
            RefreshToken = result.RefreshToken
        };
    }

    public static LoginUserResponse ToResponse(this LoginUserResult result)
    {
        return new LoginUserResponse
        {
            AccessToken = result.AccessToken,
            RefreshToken = result.RefreshToken
        };
    }

    public static RefreshTokenResponse ToResponse(this RefreshAuthSessionResult result)
    {
        return new RefreshTokenResponse
        {
            AccessToken = result.AccessToken,
            RefreshToken = result.RefreshToken
        };
    }
}
