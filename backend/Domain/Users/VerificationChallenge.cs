namespace SelectProfi.backend.Domain.Users;

public sealed class VerificationChallenge
{
    public Guid Id { get; set; }

    public VerificationChannel Channel { get; set; }

    public string Target { get; set; } = string.Empty;

    public string CodeHash { get; set; } = string.Empty;

    public int Attempts { get; set; }

    public DateTime ExpiresAtUtc { get; set; }

    public DateTime ResendAvailableAtUtc { get; set; }

    public DateTime? ConsumedAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
