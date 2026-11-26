using System.IO;

namespace SelectProfi.backend.Application.Orders;

public static class OrderMessageAttachmentPolicy
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
        [".jpeg"] = "image/jpeg",
        [".mp3"] = "audio/mpeg",
        [".m4a"] = "audio/mp4",
        [".wav"] = "audio/wav",
        [".ogg"] = "audio/ogg",
        [".mp4"] = "video/mp4",
        [".webm"] = "video/webm",
        [".mov"] = "video/quicktime"
    };

    public static bool TryNormalize(string fileName, long length, out string safeName, out string extension, out string contentType)
    {
        safeName = string.Empty;
        extension = string.Empty;
        contentType = string.Empty;
        if (length <= 0 || length > MaximumLength || string.IsNullOrWhiteSpace(fileName))
            return false;

        var leafName = Path.GetFileName(fileName.Replace('\\', '/'));
        safeName = new string(leafName.Where(character => !char.IsControl(character)).ToArray()).Trim();
        if (safeName.Length is 0 or > 255)
            return false;

        extension = Path.GetExtension(safeName).ToLowerInvariant();
        return ContentTypes.TryGetValue(extension, out contentType!);
    }
}
