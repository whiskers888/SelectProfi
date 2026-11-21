using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using SelectProfi.backend.Application.Orders.ProjectWorkspace;
using SelectProfi.backend.Infrastructure.Storage;

namespace SelectProfi.backend.Infrastructure.Orders.ProjectWorkspace;

public sealed class SupabaseS3ProjectDocumentStorage : IProjectDocumentStorage, IDisposable
{
    private readonly IAmazonS3 _client;
    private readonly S3StorageOptions _options;

    public SupabaseS3ProjectDocumentStorage(IOptions<S3StorageOptions> options)
    {
        _options = options.Value;
        _client = new AmazonS3Client(
            new BasicAWSCredentials(_options.AccessKeyId, _options.SecretAccessKey),
            new AmazonS3Config
            {
                ServiceURL = _options.Endpoint,
                ForcePathStyle = true,
                AuthenticationRegion = _options.Region
            });
    }

    public async Task<string> SaveAsync(
        Guid orderId,
        Stream content,
        string extension,
        string contentType,
        CancellationToken cancellationToken)
    {
        var key = $"projects/{orderId:N}/{Guid.NewGuid():N}{extension}";
        await _client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _options.Bucket,
            Key = key,
            InputStream = content,
            ContentType = contentType,
            AutoCloseStream = false
        }, cancellationToken);
        return key;
    }

    public async Task<byte[]> ReadAsync(string storageKey, CancellationToken cancellationToken)
    {
        using var response = await _client.GetObjectAsync(_options.Bucket, storageKey, cancellationToken);
        await using var buffer = new MemoryStream();
        await response.ResponseStream.CopyToAsync(buffer, cancellationToken);
        return buffer.ToArray();
    }

    public Task DeleteAsync(string storageKey, CancellationToken cancellationToken) =>
        _client.DeleteObjectAsync(_options.Bucket, storageKey, cancellationToken);

    public void Dispose() => _client.Dispose();
}
