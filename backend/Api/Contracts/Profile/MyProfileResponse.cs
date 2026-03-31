namespace SelectProfi.backend.Contracts.Profile;

public sealed class MyProfileResponse
{
    public Guid UserId { get; init; }

    public string Email { get; init; } = string.Empty;

    public string? Phone { get; init; }

    public string FirstName { get; init; } = string.Empty;

    public string LastName { get; init; } = string.Empty;

    public string Role { get; init; } = string.Empty;

    public string ActiveRole { get; init; } = string.Empty;

    public IReadOnlyList<string> Roles { get; init; } = [];

    public bool IsEmailVerified { get; init; }

    public bool IsPhoneVerified { get; init; }

    public ApplicantProfileResponse? ApplicantProfile { get; init; }

    public CustomerProfileResponse? CustomerProfile { get; init; }

    public ExecutorProfileResponse? ExecutorProfile { get; init; }
}
