using System.ComponentModel.DataAnnotations;

namespace SelectProfi.backend.Contracts.Orders;

public sealed class SetProjectDueDateRequest : IValidatableObject
{
    public DateOnly DueDate { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (DueDate == default)
            yield return new ValidationResult("Укажите корректную дату.", [nameof(DueDate)]);
    }
}

public sealed record ProjectActivityResponse(
    Guid Id,
    string Action,
    string Description,
    DateTime CreatedAtUtc);

public sealed record ProjectActivityListResponse(IReadOnlyList<ProjectActivityResponse> Items);

public sealed record ProjectDocumentResponse(
    Guid Id,
    string FileName,
    string ContentType,
    long Length,
    DateTime CreatedAtUtc);

public sealed record ProjectDocumentListResponse(IReadOnlyList<ProjectDocumentResponse> Items);

public sealed record ProjectDueDateResponse(Guid OrderId, DateOnly? DueDate, DateTime UpdatedAtUtc);
