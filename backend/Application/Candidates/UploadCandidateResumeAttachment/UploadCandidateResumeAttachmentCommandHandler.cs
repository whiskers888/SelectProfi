using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Candidates;

namespace SelectProfi.backend.Application.Candidates.UploadCandidateResumeAttachment;

public sealed class UploadCandidateResumeAttachmentCommandHandler(
    IResumeAttachmentStorage storage,
    IUploadCandidateResumeAttachmentPersistence persistence)
    : ICommandHandler<UploadCandidateResumeAttachmentCommand, UploadCandidateResumeAttachmentResult>
{
    private const long MaxFileSize = 25 * 1024 * 1024;
    private static readonly HashSet<string> AllowedExtensions = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".webp", ".mp4", ".webm"];

    public async Task<UploadCandidateResumeAttachmentResult> HandleAsync(UploadCandidateResumeAttachmentCommand command, CancellationToken cancellationToken)
    {
        var extension = Path.GetExtension(command.FileName).ToLowerInvariant();
        if (command.Length <= 0 || command.Length > MaxFileSize || !AllowedExtensions.Contains(extension))
            return new UploadCandidateResumeAttachmentResult { Error = "invalid_file" };

        if (!await persistence.CanUploadAsync(command.VacancyId, command.ResumeId, command.RequesterUserId, cancellationToken))
            return new UploadCandidateResumeAttachmentResult { Error = "forbidden" };

        var storedFileName = await storage.SaveAsync(command.Content, extension, cancellationToken);
        var attachment = new CandidateResumeAttachment
        {
            Id = Guid.NewGuid(), CandidateResumeId = command.ResumeId,
            OriginalFileName = Path.GetFileName(command.FileName), StoredFileName = storedFileName,
            ContentType = command.ContentType, Length = command.Length, CreatedAtUtc = DateTime.UtcNow
        };
        try
        {
            await persistence.SaveAsync(attachment, cancellationToken);
            return new UploadCandidateResumeAttachmentResult { Success = true, AttachmentId = attachment.Id };
        }
        catch
        {
            await storage.DeleteAsync(storedFileName, cancellationToken);
            throw;
        }
    }
}
