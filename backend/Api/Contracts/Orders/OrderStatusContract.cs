using System.Text.Json.Serialization;

namespace SelectProfi.backend.Contracts.Orders;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum OrderStatusContract
{
    Active = 1,
    Paused = 2
}
