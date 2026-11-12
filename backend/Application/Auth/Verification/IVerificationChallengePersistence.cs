using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Auth.Verification;

public interface IVerificationChallengePersistence
{
    Task<VerificationChallenge?> FindLatestActiveByTargetAsync(string target, CancellationToken cancellationToken);

    Task<VerificationChallenge?> FindByIdAsync(Guid challengeId, CancellationToken cancellationToken);

    Task SupersedeActiveAsync(string target, DateTime utcNow, CancellationToken cancellationToken);

    Task AddAsync(VerificationChallenge challenge, CancellationToken cancellationToken);

    Task UpdateAsync(VerificationChallenge challenge, CancellationToken cancellationToken);
}
