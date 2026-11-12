using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Auth.Verification;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Auth.Verification;

public sealed class VerificationChallengePersistence(AppDbContext dbContext) : IVerificationChallengePersistence
{
    public Task<VerificationChallenge?> FindLatestActiveByTargetAsync(
        string target,
        CancellationToken cancellationToken)
    {
        return dbContext.VerificationChallenges
            .Where(challenge => challenge.Target == target && challenge.ConsumedAtUtc == null)
            .OrderByDescending(challenge => challenge.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task<VerificationChallenge?> FindByIdAsync(Guid challengeId, CancellationToken cancellationToken)
    {
        return dbContext.VerificationChallenges.FirstOrDefaultAsync(
            challenge => challenge.Id == challengeId,
            cancellationToken);
    }

    public async Task SupersedeActiveAsync(string target, DateTime utcNow, CancellationToken cancellationToken)
    {
        var activeChallenges = await dbContext.VerificationChallenges
            .Where(challenge => challenge.Target == target && challenge.ConsumedAtUtc == null)
            .ToListAsync(cancellationToken);

        foreach (var challenge in activeChallenges)
        {
            challenge.ConsumedAtUtc = utcNow;

            if (challenge.ExpiresAtUtc > utcNow)
                challenge.ExpiresAtUtc = utcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddAsync(VerificationChallenge challenge, CancellationToken cancellationToken)
    {
        dbContext.VerificationChallenges.Add(challenge);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(VerificationChallenge challenge, CancellationToken cancellationToken)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
