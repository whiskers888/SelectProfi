using System.Security.Cryptography;
using System.Text;

namespace SelectProfi.backend.Application.Auth.Verification;

public static class VerificationTargets
{
    private static readonly char[] PhoneSeparators = [' ', '-', '(', ')'];

    public static string? NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return null;

        var cleaned = phone.Trim();

        foreach (var separator in PhoneSeparators)
            cleaned = cleaned.Replace(separator.ToString(), string.Empty, StringComparison.Ordinal);

        if (cleaned.Length == 11 && cleaned[0] == '8' && IsAsciiDigits(cleaned))
            return "+7" + cleaned[1..];

        return cleaned;
    }

    public static string? NormalizeEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;

        return email.Trim().ToUpperInvariant();
    }

    public static bool IsValidPhone(string? normalizedPhone)
    {
        if (string.IsNullOrWhiteSpace(normalizedPhone))
            return false;

        if (normalizedPhone.Length is < 11 or > 16)
            return false;

        if (normalizedPhone[0] != '+' || normalizedPhone[1] == '0')
            return false;

        return IsAsciiDigits(normalizedPhone.AsSpan(1));
    }

    public static bool IsValidEmail(string? normalizedEmail)
    {
        if (string.IsNullOrWhiteSpace(normalizedEmail) || normalizedEmail.Length > 254)
            return false;

        var atIndex = normalizedEmail.IndexOf('@', StringComparison.Ordinal);
        if (atIndex <= 0 || atIndex != normalizedEmail.LastIndexOf('@'))
            return false;

        var localPart = normalizedEmail[..atIndex];
        var domain = normalizedEmail[(atIndex + 1)..];

        if (localPart.Length == 0 || domain.Length < 3)
            return false;

        if (!domain.Contains('.', StringComparison.Ordinal))
            return false;

        return !domain.StartsWith('.') && !domain.EndsWith('.') && !domain.Contains("..", StringComparison.Ordinal);
    }

    public static string MaskPhone(string normalizedPhone)
    {
        var digits = ExtractDigits(normalizedPhone);
        if (digits.Length < 11)
            return digits.Length <= 2
                ? new string('•', digits.Length)
                : new string('•', digits.Length - 2) + digits[^2..];

        var country = digits[..^10];
        var national = digits[^10..];
        var tail = national[^4..];

        return $"+{country} ({national[..3]}) •••-{tail[..2]}-{tail[2..]}";
    }

    public static string MaskEmail(string normalizedEmail)
    {
        var atIndex = normalizedEmail.IndexOf('@', StringComparison.Ordinal);
        if (atIndex < 0)
            return "***";

        return $"{normalizedEmail[..1]}***{normalizedEmail[atIndex..]}";
    }

    public static string ComputeCodeHash(string code)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(code));

        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string ExtractDigits(string value)
    {
        var builder = new StringBuilder(value.Length);

        foreach (var character in value)
        {
            if (character is >= '0' and <= '9')
                builder.Append(character);
        }

        return builder.ToString();
    }

    private static bool IsAsciiDigits(string value) => IsAsciiDigits(value.AsSpan());

    private static bool IsAsciiDigits(ReadOnlySpan<char> value)
    {
        if (value.IsEmpty)
            return false;

        foreach (var character in value)
        {
            if (character is < '0' or > '9')
                return false;
        }

        return true;
    }
}
