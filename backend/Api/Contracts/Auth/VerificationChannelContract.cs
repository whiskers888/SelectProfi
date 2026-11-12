using System.Text.Json.Serialization;

namespace SelectProfi.backend.Contracts.Auth;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum VerificationChannelContract
{
    Phone = 1,
    Email = 2
}
