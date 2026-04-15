namespace SelectProfi.backend.Contracts.Orders;

public sealed class OrderSpecializationListResponse
{
    public IReadOnlyList<OrderSpecializationResponse> Items { get; init; } = [];
}
