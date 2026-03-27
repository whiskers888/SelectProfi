using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using SelectProfi.backend.IntegrationTests.Infrastructure;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class AuthAuthorizationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly IConfiguration _configuration;

    public AuthAuthorizationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _configuration = factory.Services.GetService(typeof(IConfiguration)) as IConfiguration
            ?? throw new InvalidOperationException("IConfiguration is not available.");
    }

    [Fact]
    public async Task MeEndpoint_WithoutAccessToken_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();
        using var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CustomerArea_WithNonCustomerRole_ReturnsForbidden()
    {
        using var client = _factory.CreateClient();
        var accessToken = CreateAccessToken(_configuration, "Applicant");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var response = await client.GetAsync("/api/auth/customer-area");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task CustomerArea_WithCustomerRole_ReturnsOk()
    {
        using var client = _factory.CreateClient();
        var accessToken = CreateAccessToken(_configuration, "Customer");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var response = await client.GetAsync("/api/auth/customer-area");
        using var payload = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("ok", payload.RootElement.GetProperty("status").GetString());
    }

    private static string CreateAccessToken(IConfiguration configuration, string role)
    {
        var issuer = configuration["Jwt:Issuer"] ?? string.Empty;
        var audience = configuration["Jwt:Audience"] ?? string.Empty;
        var signingKey = configuration["Jwt:SigningKey"] ?? string.Empty;

        if (string.IsNullOrWhiteSpace(issuer) ||
            string.IsNullOrWhiteSpace(audience) ||
            string.IsNullOrWhiteSpace(signingKey))
            throw new InvalidOperationException("JWT test configuration is not complete.");

        var utcNow = DateTime.UtcNow;
        var headerJson = JsonSerializer.Serialize(new { alg = "HS256", typ = "JWT" });
        var payloadJson = JsonSerializer.Serialize(new
        {
            sub = Guid.NewGuid().ToString(),
            email = "integration-test@selectprofi.local",
            role,
            iss = issuer,
            aud = audience,
            iat = ToUnixSeconds(utcNow),
            nbf = ToUnixSeconds(utcNow),
            exp = ToUnixSeconds(utcNow.AddMinutes(15)),
            jti = Guid.NewGuid().ToString("N")
        });

        var header = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
        var payload = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
        var signature = ComputeSignature($"{header}.{payload}", signingKey);

        return $"{header}.{payload}.{signature}";
    }

    private static string ComputeSignature(string data, string signingKey)
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
}
