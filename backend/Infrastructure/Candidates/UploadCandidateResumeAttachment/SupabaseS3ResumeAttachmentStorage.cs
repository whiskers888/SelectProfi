using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using SelectProfi.backend.Application.Candidates.UploadCandidateResumeAttachment;
using SelectProfi.backend.Infrastructure.Storage;

namespace SelectProfi.backend.Infrastructure.Candidates.UploadCandidateResumeAttachment;

public sealed class SupabaseS3ResumeAttachmentStorage : IResumeAttachmentStorage, IDisposable
{
    private readonly IAmazonS3 _client;
    private readonly S3StorageOptions _options;

    public SupabaseS3ResumeAttachmentStorage(IOptions<S3StorageOptions> options)
    {
        _options = options.Value;
        var credentials = new BasicAWSCredentials(_options.AccessKeyId, _options.SecretAccessKey);
        _client = new AmazonS3Client(credentials, new AmazonS3Config
        {
            ServiceURL = _options.Endpoint,
            ForcePathStyle = true,
            AuthenticationRegion = _options.Region,
        });
    }

    public async Task<string> SaveAsync(Stream content, string extension, CancellationToken cancellationToken)
    {
        var safeExtension = extension.StartsWith('.') ? extension.ToLowerInvariant() : string.Empty;
        var objectKey = $"resumes/{DateTime.UtcNow:yyyy/MM}/{Guid.NewGuid():N}{safeExtension}";
        await _client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _options.Bucket,
            Key = objectKey,
            InputStream = content,
            ContentType = "application/octet-stream",
            AutoCloseStream = false,
        }, cancellationToken);
        return objectKey;
    }

    public Task DeleteAsync(string objectKey, CancellationToken cancellationToken) =>
        _client.DeleteObjectAsync(_options.Bucket, objectKey, cancellationToken);

    public void Dispose() => _client.Dispose();
}
