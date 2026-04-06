using System.Text.Json.Serialization;

namespace SelectProfi.backend.Contracts.Vacancies;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum VacancyStatusContract
{
    Draft = 1,
    OnApproval = 2,
    Published = 3
}
