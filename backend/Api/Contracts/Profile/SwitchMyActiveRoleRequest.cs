using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Profile;

public sealed class SwitchMyActiveRoleRequest
{
    [Required]
    [EnumDataType(typeof(ProfileUserRole))]
    public ProfileUserRole? ActiveRole { get; init; }
}
