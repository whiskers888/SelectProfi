using System.Collections.Concurrent;
using SelectProfi.backend.Application.Auth.Login;
using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Application.Auth.Register;
using SelectProfi.backend.Application.Profile.GetMyProfile;
using SelectProfi.backend.Application.Profile.UpdateMyProfile;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.IntegrationTests.Infrastructure;

public sealed class InMemoryAuthStore
{
    public ConcurrentDictionary<Guid, User> Users { get; } = new();

    public ConcurrentDictionary<string, Guid> UserIdByNormalizedEmail { get; } = new(StringComparer.Ordinal);

    public ConcurrentDictionary<string, Guid> UserIdByNormalizedPhone { get; } = new(StringComparer.Ordinal);

    public ConcurrentDictionary<string, RefreshSession> RefreshSessionsByTokenHash { get; } = new(StringComparer.Ordinal);
}

public sealed class InMemoryRegisterUserPersistence(InMemoryAuthStore store) : IRegisterUserPersistence
{
    public Task<bool> EmailExistsAsync(string normalizedEmail, CancellationToken cancellationToken)
    {
        return Task.FromResult(store.UserIdByNormalizedEmail.ContainsKey(normalizedEmail));
    }

    public Task<bool> PhoneExistsAsync(string normalizedPhone, CancellationToken cancellationToken)
    {
        return Task.FromResult(store.UserIdByNormalizedPhone.ContainsKey(normalizedPhone));
    }

    public Task<RegisterUserPersistenceResult> CreateAsync(
        User user,
        RefreshSession refreshSession,
        CancellationToken cancellationToken)
    {
        if (!store.UserIdByNormalizedEmail.TryAdd(user.NormalizedEmail, user.Id))
            return Task.FromResult(RegisterUserPersistenceResult.Conflict);

        if (user.NormalizedPhone is not null &&
            !store.UserIdByNormalizedPhone.TryAdd(user.NormalizedPhone, user.Id))
        {
            store.UserIdByNormalizedEmail.TryRemove(user.NormalizedEmail, out _);
            return Task.FromResult(RegisterUserPersistenceResult.Conflict);
        }

        store.Users[user.Id] = user;
        refreshSession.User = user;
        store.RefreshSessionsByTokenHash[refreshSession.TokenHash] = refreshSession;

        return Task.FromResult(RegisterUserPersistenceResult.Created);
    }
}

public sealed class InMemoryLoginUserPersistence(InMemoryAuthStore store) : ILoginUserPersistence
{
    public Task<User?> FindByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken)
    {
        if (!store.UserIdByNormalizedEmail.TryGetValue(normalizedEmail, out var userId))
            return Task.FromResult<User?>(null);

        store.Users.TryGetValue(userId, out var user);
        return Task.FromResult(user);
    }

    public Task SaveRefreshSessionAsync(RefreshSession refreshSession, CancellationToken cancellationToken)
    {
        if (store.Users.TryGetValue(refreshSession.UserId, out var user))
            refreshSession.User = user;

        store.RefreshSessionsByTokenHash[refreshSession.TokenHash] = refreshSession;
        return Task.CompletedTask;
    }
}

public sealed class InMemoryRefreshAuthSessionPersistence(InMemoryAuthStore store) : IRefreshAuthSessionPersistence
{
    public Task<RefreshSession?> FindByTokenHashAsync(string tokenHash, CancellationToken cancellationToken)
    {
        store.RefreshSessionsByTokenHash.TryGetValue(tokenHash, out var refreshSession);
        return Task.FromResult(refreshSession);
    }

    public Task RotateAsync(RefreshSession currentSession, RefreshSession nextSession, CancellationToken cancellationToken)
    {
        nextSession.User = currentSession.User;
        store.RefreshSessionsByTokenHash[nextSession.TokenHash] = nextSession;
        return Task.CompletedTask;
    }
}

public sealed class InMemoryProfileReadPersistence(InMemoryAuthStore store) : IProfileReadPersistence
{
    public Task<User?> FindByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        store.Users.TryGetValue(userId, out var user);
        return Task.FromResult(user);
    }
}

public sealed class InMemoryProfileWritePersistence(InMemoryAuthStore store) : IProfileWritePersistence
{
    public Task<User?> FindByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        store.Users.TryGetValue(userId, out var user);
        return Task.FromResult(user);
    }

    public Task<bool> PhoneExistsForAnotherUserAsync(string normalizedPhone, Guid userId, CancellationToken cancellationToken)
    {
        var exists = store.UserIdByNormalizedPhone.TryGetValue(normalizedPhone, out var ownerId) && ownerId != userId;
        return Task.FromResult(exists);
    }

    public Task<ProfileWritePersistenceResult> SaveChangesAsync(CancellationToken cancellationToken)
    {
        store.UserIdByNormalizedPhone.Clear();

        foreach (var user in store.Users.Values)
        {
            if (!string.IsNullOrWhiteSpace(user.NormalizedPhone))
                store.UserIdByNormalizedPhone[user.NormalizedPhone] = user.Id;
        }

        return Task.FromResult(ProfileWritePersistenceResult.Saved);
    }
}
