using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Verification;

public sealed class SendVerificationCodeCommand : ICommand<SendVerificationCodeResult>
{
    public VerificationChannel Channel { get; init; }

    public string Target { get; init; } = string.Empty;

    public bool IncludeDebugCode { get; init; }
}
