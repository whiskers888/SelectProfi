using System.Text.Json.Serialization;

namespace SelectProfi.backend.Contracts.Profile;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ProfileUserRole
{
    Applicant = 1,
    Executor = 2,
    Customer = 3,
    Admin = 4
}
