using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SelectProfi.backend.Contracts.Auth;

public sealed class RegisterUserRequest : IValidatableObject
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,128}$")]
    public string Password { get; init; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; init; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; init; } = string.Empty;

    [RegularExpression(@"^\+[1-9]\d{9,14}$")]
    public string? Phone { get; init; }

    [EnumDataType(typeof(RegisterUserRole))]
    public RegisterUserRole? Role { get; init; }

    public List<RegisterUserRole>? Roles { get; init; }

    public CustomerRegistrationRequest? CustomerRegistration { get; init; }

    public OfferAcceptanceRequest? OfferAcceptance { get; init; }

    public IReadOnlyList<RegisterUserRole> ResolveRoles()
    {
        IReadOnlyList<RegisterUserRole> rawRoles;

        if (Roles is { Count: > 0 })
            rawRoles = Roles.Distinct().ToArray();
        else if (Role.HasValue)
            rawRoles = [Role.Value];
        else
            rawRoles = [];

        if (rawRoles.Count == 0)
            return [];

        return NormalizeRoles(rawRoles);
    }

    public RegisterUserRole? ResolvePrimaryRole()
    {
        var resolvedRoles = ResolveRoles();
        return resolvedRoles.Count > 0 ? resolvedRoles[0] : null;
    }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var resolvedRoles = ResolveRoles();
        if (resolvedRoles.Count == 0)
        {
            yield return new ValidationResult(
                "At least one role must be provided.",
                [nameof(Role), nameof(Roles)]);
            yield break;
        }

        if (resolvedRoles.Contains(RegisterUserRole.Customer) && resolvedRoles.Count > 1)
        {
            yield return new ValidationResult(
                "Customer role cannot be combined with other roles.",
                [nameof(Role), nameof(Roles)]);
            yield break;
        }

        var isCustomer = resolvedRoles.Contains(RegisterUserRole.Customer);
        if (!isCustomer)
            yield break;

        if (CustomerRegistration is null)
        {
            yield return new ValidationResult(
                "Customer registration payload is required for Customer role.",
                [nameof(CustomerRegistration)]);
            yield break;
        }

        if (string.IsNullOrWhiteSpace(CustomerRegistration.Inn))
            yield return new ValidationResult("INN is required.", [nameof(CustomerRegistration.Inn)]);

        if (CustomerRegistration.LegalForm is null)
            yield return new ValidationResult("Legal form is required.", [nameof(CustomerRegistration.LegalForm)]);
        else if (CustomerRegistration.LegalForm == CustomerLegalForm.Ooo && string.IsNullOrWhiteSpace(CustomerRegistration.Egrn))
            yield return new ValidationResult("EGRN is required for OOO.", [nameof(CustomerRegistration.Egrn)]);
        else if (CustomerRegistration.LegalForm == CustomerLegalForm.Ip && string.IsNullOrWhiteSpace(CustomerRegistration.Egrnip))
            yield return new ValidationResult("EGRNIP is required for IP.", [nameof(CustomerRegistration.Egrnip)]);

        if (OfferAcceptance is null || !OfferAcceptance.Accepted)
            yield return new ValidationResult("Offer must be accepted.", [nameof(OfferAcceptance)]);

        if (OfferAcceptance is not null && string.IsNullOrWhiteSpace(OfferAcceptance.Version))
            yield return new ValidationResult("Offer version is required.", [nameof(OfferAcceptance.Version)]);
    }

    private static IReadOnlyList<RegisterUserRole> NormalizeRoles(IReadOnlyList<RegisterUserRole> roles)
    {
        var hasCustomer = roles.Contains(RegisterUserRole.Customer);
        if (hasCustomer)
            return roles.ToArray();

        var hasApplicant = roles.Contains(RegisterUserRole.Applicant);
        var hasExecutor = roles.Contains(RegisterUserRole.Executor);
        if (!hasApplicant && !hasExecutor)
            return roles.ToArray();

        var primaryRole = roles.FirstOrDefault(role =>
            role is RegisterUserRole.Applicant or RegisterUserRole.Executor);

        return primaryRole == RegisterUserRole.Executor
            ? [RegisterUserRole.Executor, RegisterUserRole.Applicant]
            : [RegisterUserRole.Applicant, RegisterUserRole.Executor];
    }
}

public sealed class CustomerRegistrationRequest
{
    [Required]
    [RegularExpression(@"^\d{10}(\d{2})?$")]
    public string Inn { get; init; } = string.Empty;

    [EnumDataType(typeof(CustomerLegalForm))]
    public CustomerLegalForm? LegalForm { get; init; }

    [RegularExpression(@"^\d{13}$")]
    public string? Egrn { get; init; }

    [RegularExpression(@"^\d{15}$")]
    public string? Egrnip { get; init; }

    [MaxLength(255)]
    public string? CompanyName { get; init; }
}

public sealed class OfferAcceptanceRequest
{
    [JsonPropertyName("accepted")]
    public bool Accepted { get; init; }

    [Required]
    [MaxLength(100)]
    public string Version { get; init; } = string.Empty;
}
