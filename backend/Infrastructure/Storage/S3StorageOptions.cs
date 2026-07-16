namespace SelectProfi.backend.Infrastructure.Storage;

public sealed class S3StorageOptions
{
    public const string SectionName = "S3";
    public string Endpoint { get; set; } = string.Empty;
    public string Region { get; set; } = "eu-west-3";
    public string Bucket { get; set; } = string.Empty;
    public string AccessKeyId { get; set; } = string.Empty;
    public string SecretAccessKey { get; set; } = string.Empty;
}
