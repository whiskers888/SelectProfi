namespace SelectProfi.backend.Configuration;

public sealed class AuthFeatureFlagsOptions
{
    public const string SectionName = "AuthFeatureFlags";

    public bool RequireEmailVerification { get; init; }

    public bool RequirePhoneVerification { get; init; }
}
