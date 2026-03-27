using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using SelectProfi.backend.Configuration;

namespace SelectProfi.backend.Security;

public sealed class SimpleJwtAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IOptions<JwtOptions> jwtOptions)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var headerValues))
            return Task.FromResult(AuthenticateResult.NoResult());

        var authorizationHeader = headerValues.ToString();
        if (!authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return Task.FromResult(AuthenticateResult.NoResult());

        var token = authorizationHeader["Bearer ".Length..].Trim();
        if (string.IsNullOrWhiteSpace(token))
            return Task.FromResult(AuthenticateResult.Fail("Bearer token is empty."));

        var validationResult = ValidateToken(token, jwtOptions.Value);
        if (!validationResult.IsValid || validationResult.Claims.Count == 0)
            return Task.FromResult(AuthenticateResult.Fail("Invalid access token."));

        var identity = new ClaimsIdentity(validationResult.Claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    private static TokenValidationResult ValidateToken(string token, JwtOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.SigningKey))
            return TokenValidationResult.Invalid;

        var segments = token.Split('.', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length != 3)
            return TokenValidationResult.Invalid;

        var signedData = $"{segments[0]}.{segments[1]}";
        var signature = ComputeSignature(signedData, options.SigningKey);
        if (!IsSignatureValid(signature, segments[2]))
            return TokenValidationResult.Invalid;

        JsonElement payload;

        try
        {
            var payloadBytes = DecodeBase64Url(segments[1]);
            payload = JsonDocument.Parse(payloadBytes).RootElement.Clone();
        }
        catch (Exception)
        {
            return TokenValidationResult.Invalid;
        }

        if (!TryGetString(payload, "iss", out var issuer) ||
            !string.Equals(issuer, options.Issuer, StringComparison.Ordinal))
            return TokenValidationResult.Invalid;

        if (!TryGetString(payload, "aud", out var audience) ||
            !string.Equals(audience, options.Audience, StringComparison.Ordinal))
            return TokenValidationResult.Invalid;

        var nowUnix = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        if (!TryGetLong(payload, "nbf", out var notBefore) || nowUnix < notBefore)
            return TokenValidationResult.Invalid;

        if (!TryGetLong(payload, "exp", out var expiresAt) || nowUnix >= expiresAt)
            return TokenValidationResult.Invalid;

        if (!TryGetString(payload, "sub", out var subject) ||
            !TryGetString(payload, "email", out var email) ||
            !TryGetString(payload, "role", out var role))
            return TokenValidationResult.Invalid;

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, subject),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Role, role)
        };

        return TokenValidationResult.Valid(claims);
    }

    private static bool TryGetString(JsonElement element, string propertyName, out string value)
    {
        if (element.TryGetProperty(propertyName, out var property) &&
            property.ValueKind == JsonValueKind.String &&
            !string.IsNullOrWhiteSpace(property.GetString()))
        {
            value = property.GetString()!;
            return true;
        }

        value = string.Empty;
        return false;
    }

    private static bool TryGetLong(JsonElement element, string propertyName, out long value)
    {
        if (element.TryGetProperty(propertyName, out var property) && property.TryGetInt64(out value))
            return true;

        value = 0;
        return false;
    }

    private static byte[] DecodeBase64Url(string encoded)
    {
        var base64 = encoded.Replace('-', '+').Replace('_', '/');

        var paddingLength = 4 - (base64.Length % 4);
        if (paddingLength is > 0 and < 4)
            base64 = base64.PadRight(base64.Length + paddingLength, '=');

        return Convert.FromBase64String(base64);
    }

    private static string ComputeSignature(string data, string signingKey)
    {
        var keyBytes = Encoding.UTF8.GetBytes(signingKey);
        var dataBytes = Encoding.UTF8.GetBytes(data);

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

    private sealed class TokenValidationResult
    {
        public static TokenValidationResult Invalid { get; } = new(false, []);

        public bool IsValid { get; }

        public IReadOnlyList<Claim> Claims { get; }

        private TokenValidationResult(bool isValid, IReadOnlyList<Claim> claims)
        {
            IsValid = isValid;
            Claims = claims;
        }

        public static TokenValidationResult Valid(IReadOnlyList<Claim> claims) => new(true, claims);
    }
}
