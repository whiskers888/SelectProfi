namespace SelectProfi.backend.Application.Candidates.UploadCandidateResumeAttachment;

public interface IResumeAttachmentStorage
{
    Task<string> SaveAsync(Stream content, string extension, CancellationToken cancellationToken);
    Task DeleteAsync(string storedFileName, CancellationToken cancellationToken);
}
