using System.Net.Sockets;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace SelectProfi.backend.HealthChecks;

public sealed class RedisDependencyHealthCheck(IConfiguration configuration) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var connectionString = configuration.GetConnectionString("Redis");

        if (string.IsNullOrWhiteSpace(connectionString))
            return HealthCheckResult.Unhealthy("ConnectionStrings:Redis is not configured.");

        if (!TryParseEndpoint(connectionString, 6379, out var host, out var port))
            return HealthCheckResult.Unhealthy("Invalid Redis connection string format.");

        try
        {
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(2));

            using var client = new TcpClient();
            await client.ConnectAsync(host, port, timeoutCts.Token);

            return client.Connected
                ? HealthCheckResult.Healthy()
                : HealthCheckResult.Unhealthy("Redis is unavailable.");
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Unhealthy("Redis is unavailable.", exception);
        }
    }

    private static bool TryParseEndpoint(string connectionString, int defaultPort, out string host, out int port)
    {
        var endpoint = connectionString.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).FirstOrDefault();

        if (string.IsNullOrWhiteSpace(endpoint))
        {
            host = string.Empty;
            port = 0;
            return false;
        }

        var separatorIndex = endpoint.LastIndexOf(':');
        if (separatorIndex <= 0)
        {
            host = endpoint;
            port = defaultPort;
            return true;
        }

        host = endpoint[..separatorIndex];
        return int.TryParse(endpoint[(separatorIndex + 1)..], out port);
    }
}
