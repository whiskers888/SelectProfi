using System.Text.Json.Serialization;

namespace SelectProfi.backend.Contracts.Orders;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum OrderExecutorResponseStatusContract
{
    Pending = 1,
    Withdrawn = 2,
    Accepted = 3,
    Rejected = 4
}
