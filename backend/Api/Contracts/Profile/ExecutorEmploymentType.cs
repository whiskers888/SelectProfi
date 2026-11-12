using System.Text.Json.Serialization;

namespace SelectProfi.backend.Contracts.Profile;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ExecutorEmploymentType
{
    Fl = 1,
    Smz = 2,
    Ip = 3
}
