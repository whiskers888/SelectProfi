namespace SelectProfi.backend.Application.Orders.CreateOrderSpecialization;

public sealed class CreateOrderSpecializationResult
{
    public CreateOrderSpecializationErrorCode ErrorCode { get; init; } = CreateOrderSpecializationErrorCode.None;

    public Guid SpecializationId { get; init; }

    public string Name { get; init; } = string.Empty;

    public bool IsActive { get; init; }

    public int SortOrder { get; init; }

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
