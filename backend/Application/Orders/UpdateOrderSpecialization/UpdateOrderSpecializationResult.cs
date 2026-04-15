namespace SelectProfi.backend.Application.Orders.UpdateOrderSpecialization;

public sealed class UpdateOrderSpecializationResult
{
    public UpdateOrderSpecializationErrorCode ErrorCode { get; init; } = UpdateOrderSpecializationErrorCode.None;

    public Guid SpecializationId { get; init; }

    public string Name { get; init; } = string.Empty;

    public bool IsActive { get; init; }

    public int SortOrder { get; init; }

    public DateTime CreatedAtUtc { get; init; }

    public DateTime UpdatedAtUtc { get; init; }
}
