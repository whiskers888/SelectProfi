using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using SelectProfi.backend.Application.Auth.Verification;
using SelectProfi.backend.Configuration;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Security;

public sealed class VerificationTokenIssuer(IOptions<JwtOptions> jwtOptions) : IVerificationTokenIssuer
{
    private static readonly TimeSpan TokenLifetime = TimeSpan.FromMinutes(15);

    public string Issue(VerificationChannel channel, string target, DateTime utcNow)
    {
        var options = jwtOptions.Value;

        if (string.IsNullOrWhiteSpace(options.SigningKey))
            throw new InvalidOperationException("Jwt:SigningKey is not configured.");

        var payloadJson = JsonSerializer.Serialize(new
        {
            ch = channel.ToString(),
            tgt = target,
            exp = new DateTimeOffset(utcNow.Add(TokenLifetime)).ToUnixTimeSeconds()
        });

        var encodedPayload = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
        var signature = ComputeSignature(encodedPayload, options.SigningKey);

        return $"{encodedPayload}.{signature}";
    }

    public VerificationTokenPayload? Validate(string token, DateTime utcNow)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        var options = jwtOptions.Value;

        if (string.IsNullOrWhiteSpace(options.SigningKey))
            return null;

        var segments = token.Split('.', StringSplitOptions.None);
        if (segments.Length != 2)
            return null;

        var expectedSignature = ComputeSignature(segments[0], options.SigningKey);
        if (!IsSignatureValid(expectedSignature, segments[1]))
            return null;

        JsonElement payload;

        try
        {
            var payloadBytes = DecodeBase64Url(segments[0]);
            payload = JsonDocument.Parse(payloadBytes).RootElement.Clone();
        }
        catch (Exception)
        {
            return null;
        }

        if (!payload.TryGetProperty("ch", out var channelProperty) ||
            channelProperty.ValueKind != JsonValueKind.String ||
            !Enum.TryParse<VerificationChannel>(channelProperty.GetString(), ignoreCase: false, out var channel) ||
            !Enum.IsDefined(channel))
            return null;

        if (!payload.TryGetProperty("tgt", out var targetProperty) ||
            targetProperty.ValueKind != JsonValueKind.String)
            return null;

        var target = targetProperty.GetString();
        if (string.IsNullOrWhiteSpace(target))
            return null;

        if (!payload.TryGetProperty("exp", out var expiresProperty) ||
            !expiresProperty.TryGetInt64(out var expiresUnix))
            return null;

        var expiresAtUtc = DateTimeOffset.FromUnixTimeSeconds(expiresUnix).UtcDateTime;
        if (expiresAtUtc <= utcNow)
            return null;

        return new VerificationTokenPayload(channel, target, expiresAtUtc);
    }

    private static string ComputeSignature(string encodedPayload, string signingKey)
    {
        var keyBytes = Encoding.UTF8.GetBytes(signingKey);
        var dataBytes = Encoding.UTF8.GetBytes(encodedPayload);

        using var hmac = new HMACSHA256(keyBytes);
        var signature = hmac.ComputeHash(dataBytes);

        return Base64UrlEncode(signature);
    }

    private static bool IsSignatureValid(string expectedSignature, string actualSignature)
    {
        var expectedBytes = Encoding.UTF8.GetBytes(expectedSignature);
        var actualBytes = Encoding.UTF8.GetBytes(actualSignature);

        return expectedBytes.Length == actualBytes.Length &&
               CryptographicOperations.FixedTimeEquals(expectedBytes, actualBytes);
    }

    private static string Base64UrlEncode(byte[] input)
    {
        return Convert.ToBase64String(input)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static byte[] DecodeBase64Url(string encoded)
    {
        var base64 = encoded.Replace('-', '+').Replace('_', '/');

        var paddingLength = 4 - (base64.Length % 4);
        if (paddingLength is > 0 and < 4)
            base64 = base64.PadRight(base64.Length + paddingLength, '=');

        return Convert.FromBase64String(base64);
    }
}
