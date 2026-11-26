namespace SelectProfi.backend.Application.Orders.SetOrderFavorite;

public enum SetOrderFavoriteErrorCode { None, Forbidden, NotFound }

public sealed class SetOrderFavoriteResult
{
    public SetOrderFavoriteErrorCode ErrorCode { get; init; }
    public Guid OrderId { get; init; }
    public bool IsFavorite { get; init; }
}
