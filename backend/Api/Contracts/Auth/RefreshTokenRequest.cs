using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Auth;

public sealed class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; init; } = string.Empty;
}
