namespace SelectProfi.backend.Application.Auth.Verification;

public enum ConfirmVerificationCodeErrorCode
{
    None = 0,
    ChallengeExpired = 1,
    InvalidCode = 2,
    AttemptsExceeded = 3
}
