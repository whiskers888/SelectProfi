using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Orders;

public sealed class GetOrdersRequest
{
    [Range(1, 100)]
    public int Limit { get; init; } = 20;

    [Range(0, int.MaxValue)]
    public int Offset { get; init; }
}
