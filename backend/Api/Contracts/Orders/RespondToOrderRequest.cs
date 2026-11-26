using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Orders;

public sealed class RespondToOrderRequest
{
    [MaxLength(2000)]
    public string Message { get; init; } = string.Empty;
}
