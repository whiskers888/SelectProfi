using System.Security.Cryptography;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Verification;

public sealed class SendVerificationCodeCommandHandler(
    IVerificationChallengePersistence persistence,
    IVerificationCodeSender codeSender,
    IRegisterUserPersistence userPersistence) : ICommandHandler<SendVerificationCodeCommand, SendVerificationCodeResult>
{
    public const int CodeLength = 6;
    public const string DevelopmentCode = "123456";
    private static readonly TimeSpan ChallengeLifetime = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan ResendWindow = TimeSpan.FromSeconds(60);

    public async Task<SendVerificationCodeResult> HandleAsync(
        SendVerificationCodeCommand command,
        CancellationToken cancellationToken)
    {
        var target = command.Channel switch
        {
            VerificationChannel.Phone => VerificationTargets.NormalizePhone(command.Target),
            VerificationChannel.Email => VerificationTargets.NormalizeEmail(command.Target),
            _ => null
        };

        if (target is null || !IsValidTarget(command.Channel, target))
            return new SendVerificationCodeResult { ErrorCode = SendVerificationCodeErrorCode.InvalidTarget };

        if (command.RejectExistingTarget && await TargetExistsAsync(command.Channel, target, cancellationToken))
            return new SendVerificationCodeResult
            {
                ErrorCode = SendVerificationCodeErrorCode.TargetAlreadyRegistered,
                Channel = command.Channel.ToString()
            };

        var utcNow = DateTime.UtcNow;
        var activeChallenge = await persistence.FindLatestActiveByTargetAsync(target, cancellationToken);
        if (activeChallenge is not null && activeChallenge.ResendAvailableAtUtc > utcNow)
            return new SendVerificationCodeResult { ErrorCode = SendVerificationCodeErrorCode.ResendTooSoon };

        await persistence.SupersedeActiveAsync(target, utcNow, cancellationToken);

        var code = command.UseDevelopmentCode ? DevelopmentCode : GenerateCode();
        var challenge = new VerificationChallenge
        {
            Id = Guid.NewGuid(),
            Channel = command.Channel,
            Target = target,
            CodeHash = VerificationTargets.ComputeCodeHash(code),
            Attempts = 0,
            ExpiresAtUtc = utcNow.Add(ChallengeLifetime),
            ResendAvailableAtUtc = utcNow.Add(ResendWindow),
            ConsumedAtUtc = null,
            CreatedAtUtc = utcNow
        };

        await persistence.AddAsync(challenge, cancellationToken);
        await codeSender.SendAsync(command.Channel, target, code, cancellationToken);

        return new SendVerificationCodeResult
        {
            ErrorCode = SendVerificationCodeErrorCode.None,
            ChallengeId = challenge.Id,
            Channel = challenge.Channel.ToString(),
            MaskedTarget = command.Channel == VerificationChannel.Phone
                ? VerificationTargets.MaskPhone(target)
                : VerificationTargets.MaskEmail(target),
            CodeLength = CodeLength,
            ExpiresAtUtc = challenge.ExpiresAtUtc,
            ResendAvailableAtUtc = challenge.ResendAvailableAtUtc,
            DebugCode = command.IncludeDebugCode ? code : null,
            DevelopmentMode = command.UseDevelopmentCode
        };
    }

    private Task<bool> TargetExistsAsync(
        VerificationChannel channel,
        string target,
        CancellationToken cancellationToken)
    {
        return channel switch
        {
            VerificationChannel.Phone => userPersistence.PhoneExistsAsync(target, cancellationToken),
            VerificationChannel.Email => userPersistence.EmailExistsAsync(target, cancellationToken),
            _ => Task.FromResult(false)
        };
    }

    private static bool IsValidTarget(VerificationChannel channel, string target)
    {
        return channel switch
        {
            VerificationChannel.Phone => VerificationTargets.IsValidPhone(target),
            VerificationChannel.Email => VerificationTargets.IsValidEmail(target),
            _ => false
        };
    }

    private static string GenerateCode()
    {
        var value = RandomNumberGenerator.GetInt32(0, 1_000_000);

        return value.ToString("D6", System.Globalization.CultureInfo.InvariantCulture);
    }
}
