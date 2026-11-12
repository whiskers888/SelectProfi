namespace SelectProfi.backend.Application.Auth.Register;

public enum RegisterUserErrorCode
{
    None = 0,
    EmailAlreadyExists = 1,
    PhoneAlreadyExists = 2,
    UserAlreadyExists = 3,
    VerificationTokenMismatch = 4,
    IdentifierRequired = 5,
    VerificationRequired = 6
}
