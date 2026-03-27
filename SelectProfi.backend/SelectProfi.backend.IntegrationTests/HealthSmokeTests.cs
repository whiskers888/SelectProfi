using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using SelectProfi.backend.IntegrationTests.Infrastructure;
using Xunit;

namespace SelectProfi.backend.IntegrationTests;

public sealed class HealthSmokeTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public HealthSmokeTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsOk()
    {
        using var client = _factory.CreateClient();
        using var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task DependencyHealthEndpoint_ReturnsDiagnosticPayload()
    {
        using var client = _factory.CreateClient();
        using var response = await client.GetAsync("/health/dependencies");
        using var payload = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = payload.RootElement;

        Assert.True(
            response.StatusCode == HttpStatusCode.OK ||
            response.StatusCode == HttpStatusCode.ServiceUnavailable);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        Assert.True(root.TryGetProperty("status", out _));
        Assert.True(root.TryGetProperty("checks", out var checks));
        Assert.Equal(JsonValueKind.Array, checks.ValueKind);
    }

    [Fact]
    public async Task OpenApiDocument_ContainsHealthEndpoints()
    {
        using var application = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder => builder.UseEnvironment("Development"));
        using var client = application.CreateClient();
        using var response = await client.GetAsync("/openapi/v1.json");
        using var payload = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = payload.RootElement;
        var paths = root.GetProperty("paths");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        Assert.True(root.TryGetProperty("openapi", out _));
        Assert.True(paths.TryGetProperty("/health", out var healthPath));
        Assert.True(healthPath.TryGetProperty("get", out _));
        Assert.True(paths.TryGetProperty("/health/dependencies", out var dependenciesPath));
        Assert.True(dependenciesPath.TryGetProperty("get", out _));
    }
}
