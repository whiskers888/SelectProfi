using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using SelectProfi.backend.IntegrationTests.Infrastructure;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class ErrorContractTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public ErrorContractTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ValidationError_ReturnsUnifiedProblemDetails()
    {
        using var client = _factory.CreateClient();
        using var response = await client.PostAsJsonAsync("/test/error-contract/validation", new { });
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = json.RootElement;

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("validation_error", root.GetProperty("code").GetString());
        Assert.Equal(400, root.GetProperty("status").GetInt32());
        Assert.True(root.TryGetProperty("traceId", out var traceId));
        Assert.False(string.IsNullOrWhiteSpace(traceId.GetString()));
        Assert.True(root.TryGetProperty("errors", out var errors));
        Assert.Equal(JsonValueKind.Array, errors.ValueKind);
        Assert.NotEqual(0, errors.GetArrayLength());
    }

    [Fact]
    public async Task UnhandledException_ReturnsUnifiedProblemDetails()
    {
        using var client = _factory.CreateClient();
        using var response = await client.GetAsync("/test/error-contract/exception");
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = json.RootElement;

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("internal_error", root.GetProperty("code").GetString());
        Assert.Equal(500, root.GetProperty("status").GetInt32());
        Assert.True(root.TryGetProperty("traceId", out var traceId));
        Assert.False(string.IsNullOrWhiteSpace(traceId.GetString()));
    }
}
