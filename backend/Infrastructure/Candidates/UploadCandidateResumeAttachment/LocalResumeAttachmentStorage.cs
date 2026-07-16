using SelectProfi.backend.Application.Candidates.UploadCandidateResumeAttachment;

namespace SelectProfi.backend.Infrastructure.Candidates.UploadCandidateResumeAttachment;

public sealed class LocalResumeAttachmentStorage : IResumeAttachmentStorage
{
    private readonly string _rootPath = Path.Combine(AppContext.BaseDirectory, "uploads", "resumes");

    public async Task<string> SaveAsync(Stream content, string extension, CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(_rootPath);
        var storedFileName = $"{Guid.NewGuid():N}{extension}";
        var path = Path.Combine(_rootPath, storedFileName);
        await using var target = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None);
        await content.CopyToAsync(target, cancellationToken);
        return storedFileName;
    }

    public Task DeleteAsync(string storedFileName, CancellationToken cancellationToken)
    {
        var safeFileName = Path.GetFileName(storedFileName);
        var path = Path.Combine(_rootPath, safeFileName);
        if (File.Exists(path)) File.Delete(path);
        return Task.CompletedTask;
    }
}
