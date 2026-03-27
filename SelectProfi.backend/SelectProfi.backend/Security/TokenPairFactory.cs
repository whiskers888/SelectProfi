using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using SelectProfi.backend.Configuration;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Security;

public interface ITokenPairFactory
{
    TokenPair Create(User user, DateTime utcNow);

    string HashRefreshToken(string refreshToken);
}

public sealed class TokenPairFactory(IOptions<JwtOptions> jwtOptions) : ITokenPairFactory
{
    public TokenPair Create(User user, DateTime utcNow)
    {
        var options = jwtOptions.Value;

        if (string.IsNullOrWhiteSpace(options.SigningKey))
            throw new InvalidOperationException("Jwt:SigningKey is not configured.");

        var accessToken = CreateAccessToken(user, options, utcNow);
        var refreshToken = CreateRefreshToken();
        var refreshTokenHash = HashRefreshToken(refreshToken);
        var refreshTokenExpiresAtUtc = utcNow.AddDays(options.RefreshTokenLifetimeDays);

        return new TokenPair
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            RefreshTokenHash = refreshTokenHash,
            RefreshTokenExpiresAtUtc = refreshTokenExpiresAtUtc
        };
    }

    public string HashRefreshToken(string refreshToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(refreshToken);

        var tokenBytes = Encoding.UTF8.GetBytes(refreshToken.Trim());
        var tokenHashBytes = SHA256.HashData(tokenBytes);

        return Convert.ToBase64String(tokenHashBytes);
    }

    private static string CreateAccessToken(User user, JwtOptions options, DateTime utcNow)
    {
        var headerJson = JsonSerializer.Serialize(new { alg = "HS256", typ = "JWT" });
        var expiresAt = utcNow.AddMinutes(options.AccessTokenLifetimeMinutes);

        var payloadJson = JsonSerializer.Serialize(new
        {
            sub = user.Id.ToString(),
            email = user.Email,
            role = user.Role.ToString(),
            iss = options.Issuer,
            aud = options.Audience,
            iat = ToUnixSeconds(utcNow),
            nbf = ToUnixSeconds(utcNow),
            exp = ToUnixSeconds(expiresAt),
            jti = Guid.NewGuid().ToString("N")
        });

        var header = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
        var payload = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
        var signature = CreateSignature($"{header}.{payload}", options.SigningKey);

        return $"{header}.{payload}.{signature}";
    }

    private static string CreateSignature(string data, string signingKey)
    {
        var keyBytes = Encoding.UTF8.GetBytes(signingKey);
        var dataBytes = Encoding.UTF8.GetBytes(data);

        using var hmac = new HMACSHA256(keyBytes);
        var signature = hmac.ComputeHash(dataBytes);

        return Base64UrlEncode(signature);
    }

    private static string Base64UrlEncode(byte[] input)
    {
        return Convert.ToBase64String(input)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static long ToUnixSeconds(DateTime utcDateTime)
    {
        return new DateTimeOffset(utcDateTime).ToUnixTimeSeconds();
    }

    private static string CreateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
}
