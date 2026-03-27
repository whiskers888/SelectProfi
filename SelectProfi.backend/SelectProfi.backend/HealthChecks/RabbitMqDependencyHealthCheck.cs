using System.Net.Sockets;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace SelectProfi.backend.HealthChecks;

public sealed class RabbitMqDependencyHealthCheck(IConfiguration configuration) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var connectionString = configuration.GetConnectionString("RabbitMq");

        if (string.IsNullOrWhiteSpace(connectionString))
            return HealthCheckResult.Unhealthy("ConnectionStrings:RabbitMq is not configured.");

        if (!Uri.TryCreate(connectionString, UriKind.Absolute, out var uri) || string.IsNullOrWhiteSpace(uri.Host))
            return HealthCheckResult.Unhealthy("Invalid RabbitMQ connection string format.");

        var port = uri.Port > 0 ? uri.Port : 5672;

        try
        {
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(2));

            using var client = new TcpClient();
            await client.ConnectAsync(uri.Host, port, timeoutCts.Token);

            return client.Connected
                ? HealthCheckResult.Healthy()
                : HealthCheckResult.Unhealthy("RabbitMQ is unavailable.");
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Unhealthy("RabbitMQ is unavailable.", exception);
        }
    }
}
