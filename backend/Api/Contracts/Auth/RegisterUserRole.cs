using System.Text.Json.Serialization;

namespace SelectProfi.backend.Contracts.Auth;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RegisterUserRole
{
    Applicant = 1,
    Executor = 2,
    Customer = 3
}
