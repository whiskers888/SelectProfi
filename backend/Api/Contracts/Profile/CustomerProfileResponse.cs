namespace SelectProfi.backend.Contracts.Profile;

public sealed class CustomerProfileResponse
{
    public string? Inn { get; init; }

    public CustomerLegalForm? LegalForm { get; init; }

    public string? Egrn { get; init; }

    public string? Egrnip { get; init; }

    public string? CompanyName { get; init; }

    public string? CompanyLogoUrl { get; init; }

    public bool OfferAccepted { get; init; }

    public string? OfferVersion { get; init; }

    public DateTime? OfferAcceptedAtUtc { get; init; }
}
