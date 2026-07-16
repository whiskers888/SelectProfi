namespace SelectProfi.backend.Application.Candidates.UploadCandidateResumeAttachment;

public interface IResumeAttachmentStorage
{
    Task<string> SaveAsync(Stream content, string extension, string contentType, CancellationToken cancellationToken);
    Task DeleteAsync(string objectKey, CancellationToken cancellationToken);
}
