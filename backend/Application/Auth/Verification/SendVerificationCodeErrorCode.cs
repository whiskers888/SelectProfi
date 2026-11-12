namespace SelectProfi.backend.Application.Auth.Verification;

public enum SendVerificationCodeErrorCode
{
    None = 0,
    InvalidTarget = 1,
    ResendTooSoon = 2
}
