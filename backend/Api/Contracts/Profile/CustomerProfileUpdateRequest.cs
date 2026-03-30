namespace SelectProfi.backend.Contracts.Profile;

public sealed class CustomerProfileUpdateRequest
{
    public string? Inn { get; init; }

    public string? Egrn { get; init; }

    public string? Egrnip { get; init; }

    public string? CompanyName { get; init; }

    public string? CompanyLogoUrl { get; init; }
}
