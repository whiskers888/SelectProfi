namespace SelectProfi.backend.Configuration;

public sealed class PostgresOptions
{
    public const string SectionName = "ConnectionStrings";

    public string? Postgres { get; init; }
}
