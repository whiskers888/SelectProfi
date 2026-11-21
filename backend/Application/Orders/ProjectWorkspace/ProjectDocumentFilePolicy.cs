using System.IO;

namespace SelectProfi.backend.Application.Orders.ProjectWorkspace;

public static class ProjectDocumentFilePolicy
{
    public const long MaximumLength = 25 * 1024 * 1024;

    private static readonly IReadOnlyDictionary<string, string> ContentTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        [".pdf"] = "application/pdf",
        [".doc"] = "application/msword",
        [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        [".xls"] = "application/vnd.ms-excel",
        [".xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        [".csv"] = "text/csv",
        [".txt"] = "text/plain",
        [".rtf"] = "application/rtf",
        [".png"] = "image/png",
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg"
    };

    public static bool TryNormalize(
        string fileName,
        long length,
        out string safeFileName,
        out string extension,
        out string contentType)
    {
        safeFileName = string.Empty;
        extension = string.Empty;
        contentType = string.Empty;
        if (length <= 0 || length > MaximumLength || string.IsNullOrWhiteSpace(fileName))
            return false;

        var leafName = Path.GetFileName(fileName.Replace('\\', '/'));
        safeFileName = new string(leafName.Where(character => !char.IsControl(character)).ToArray()).Trim();
        if (safeFileName.Length is 0 or > 255)
            return false;

        extension = Path.GetExtension(safeFileName).ToLowerInvariant();
        if (!ContentTypes.TryGetValue(extension, out contentType!))
            return false;

        return true;
    }
}
