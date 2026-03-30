using SelectProfi.backend.Application.Auth.Refresh;
using SelectProfi.backend.Domain.Users;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class RefreshAuthSessionCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_ReturnsInvalid_WhenRefreshTokenIsEmpty()
    {
        var persistence = new FakeRefreshPersistence();
        var handler = new RefreshAuthSessionCommandHandler(
            persistence,
            new FakeRefreshTokenHasher(),
            new FakeRefreshTokenPairIssuer());

        var result = await handler.HandleAsync(
            new RefreshAuthSessionCommand { RefreshToken = string.Empty },
            CancellationToken.None);

        Assert.Equal(RefreshAuthSessionErrorCode.InvalidRefreshToken, result.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_ReturnsInvalid_WhenSessionNotFound()
    {
        var persistence = new FakeRefreshPersistence();
        var handler = new RefreshAuthSessionCommandHandler(
            persistence,
            new FakeRefreshTokenHasher(),
            new FakeRefreshTokenPairIssuer());

        var result = await handler.HandleAsync(
            new RefreshAuthSessionCommand { RefreshToken = "raw-token" },
            CancellationToken.None);

        Assert.Equal(RefreshAuthSessionErrorCode.InvalidRefreshToken, result.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_ReturnsInvalid_WhenSessionRevoked()
    {
        var persistence = new FakeRefreshPersistence();
        var session = BuildSession();
        session.RevokedAtUtc = DateTime.UtcNow;
        persistence.StoredSession = session;

        var handler = new RefreshAuthSessionCommandHandler(
            persistence,
            new FakeRefreshTokenHasher(),
            new FakeRefreshTokenPairIssuer());

        var result = await handler.HandleAsync(
            new RefreshAuthSessionCommand { RefreshToken = "raw-token" },
            CancellationToken.None);

        Assert.Equal(RefreshAuthSessionErrorCode.InvalidRefreshToken, result.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_ReturnsInvalid_WhenSessionExpired()
    {
        var persistence = new FakeRefreshPersistence();
        var session = BuildSession();
        session.ExpiresAtUtc = DateTime.UtcNow.AddSeconds(-1);
        persistence.StoredSession = session;

        var handler = new RefreshAuthSessionCommandHandler(
            persistence,
            new FakeRefreshTokenHasher(),
            new FakeRefreshTokenPairIssuer());

        var result = await handler.HandleAsync(
            new RefreshAuthSessionCommand { RefreshToken = "raw-token" },
            CancellationToken.None);

        Assert.Equal(RefreshAuthSessionErrorCode.InvalidRefreshToken, result.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_RotatesSession_AndReturnsTokens_WhenSessionIsValid()
    {
        var persistence = new FakeRefreshPersistence();
        var session = BuildSession();
        persistence.StoredSession = session;

        var handler = new RefreshAuthSessionCommandHandler(
            persistence,
            new FakeRefreshTokenHasher(),
            new FakeRefreshTokenPairIssuer());

        var result = await handler.HandleAsync(
            new RefreshAuthSessionCommand { RefreshToken = "raw-token" },
            CancellationToken.None);

        Assert.Equal(RefreshAuthSessionErrorCode.None, result.ErrorCode);
        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("refresh-token", result.RefreshToken);
        Assert.NotNull(session.RevokedAtUtc);
        Assert.True(persistence.WasRotated);
        Assert.NotNull(persistence.RotatedSession);
        Assert.Equal(session.UserId, persistence.RotatedSession!.UserId);
        Assert.Equal("refresh-token-hash", persistence.RotatedSession.TokenHash);
    }

    private static RefreshSession BuildSession()
    {
        var userId = Guid.NewGuid();

        return new RefreshSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            User = new User
            {
                Id = userId,
                Email = "user@test.local",
                NormalizedEmail = "USER@TEST.LOCAL",
                PasswordHash = "hash",
                FirstName = "User",
                LastName = "Test",
                Role = UserRole.Customer,
                CreatedAtUtc = DateTime.UtcNow
            },
            TokenHash = "hashed::raw-token",
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(5),
            CreatedAtUtc = DateTime.UtcNow.AddMinutes(-5)
        };
    }

    private sealed class FakeRefreshPersistence : IRefreshAuthSessionPersistence
    {
        public RefreshSession? StoredSession { get; set; }

        public bool WasRotated { get; private set; }

        public RefreshSession? RotatedSession { get; private set; }

        public Task<RefreshSession?> FindByTokenHashAsync(string tokenHash, CancellationToken cancellationToken)
        {
            if (StoredSession is null)
                return Task.FromResult<RefreshSession?>(null);

            return Task.FromResult(StoredSession.TokenHash == tokenHash ? StoredSession : null);
        }

        public Task RotateAsync(RefreshSession currentSession, RefreshSession nextSession, CancellationToken cancellationToken)
        {
            WasRotated = true;
            RotatedSession = nextSession;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeRefreshTokenHasher : IRefreshTokenHasher
    {
        public string HashRefreshToken(string refreshToken)
        {
            return $"hashed::{refreshToken}";
        }
    }

    private sealed class FakeRefreshTokenPairIssuer : IRefreshTokenPairIssuer
    {
        public RefreshIssuedTokenPair Issue(User user, DateTime utcNow)
        {
            return new RefreshIssuedTokenPair
            {
                AccessToken = "access-token",
                RefreshToken = "refresh-token",
                RefreshTokenHash = "refresh-token-hash",
                RefreshTokenExpiresAtUtc = utcNow.AddDays(30)
            };
        }
    }
}
