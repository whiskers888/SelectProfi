using System.Text.Json.Serialization;

namespace SelectProfi.backend.Contracts.Auth;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CustomerLegalForm
{
    Ooo = 1,
    Ip = 2
}
