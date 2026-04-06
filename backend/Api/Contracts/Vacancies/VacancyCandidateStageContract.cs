using System.Text.Json.Serialization;

namespace SelectProfi.backend.Contracts.Vacancies;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum VacancyCandidateStageContract
{
    Pool = 1,
    Shortlist = 2
}
