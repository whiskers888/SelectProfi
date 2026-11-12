using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Application.Auth.Verification;
using SelectProfi.backend.Contracts.Auth;

namespace Api.Mappings;

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

    public static SendVerificationCodeResponse ToResponse(this SendVerificationCodeResult result)
    {
        return new SendVerificationCodeResponse
        {
            ChallengeId = result.ChallengeId,
            Channel = result.Channel,
            MaskedTarget = result.MaskedTarget,
            CodeLength = result.CodeLength,
            ExpiresAtUtc = result.ExpiresAtUtc,
            ResendAvailableAtUtc = result.ResendAvailableAtUtc,
            DebugCode = result.DebugCode
        };
    }

    public static ConfirmVerificationCodeResponse ToResponse(this ConfirmVerificationCodeResult result)
    {
        return new ConfirmVerificationCodeResponse
        {
            VerificationToken = result.VerificationToken,
            Channel = result.Channel,
            Target = result.Target,
            VerifiedAtUtc = result.VerifiedAtUtc
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
