using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SelectProfi.backend.Application.Candidates.UploadCandidateResumeAttachment;
using SelectProfi.backend.Infrastructure.Candidates.UploadCandidateResumeAttachment;
using SelectProfi.backend.Infrastructure.Storage;

namespace Infrastructure;

public static class StorageServiceCollectionExtensions
{
    public static IServiceCollection AddResumeAttachmentStorage(this IServiceCollection services)
    {
        services.AddOptions<S3StorageOptions>().Configure<IConfiguration>((options, configuration) =>
        {
            options.Endpoint = configuration["S3:Endpoint"] ?? string.Empty;
            options.Region = configuration["S3:Region"] ?? "eu-west-3";
            options.Bucket = configuration["S3:Bucket"] ?? string.Empty;
            options.AccessKeyId = configuration["S3:AccessKeyId"] ?? string.Empty;
            options.SecretAccessKey = configuration["S3:SecretAccessKey"] ?? string.Empty;
        });
        services.AddSingleton<IResumeAttachmentStorage, SupabaseS3ResumeAttachmentStorage>();
        return services;
    }
}
