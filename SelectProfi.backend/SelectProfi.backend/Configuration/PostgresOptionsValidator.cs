using FluentValidation;

namespace SelectProfi.backend.Configuration;

public sealed class PostgresOptionsValidator : AbstractValidator<PostgresOptions>
{
    public PostgresOptionsValidator()
    {
        RuleFor(options => options.Postgres)
            .NotEmpty()
            .WithMessage("ConnectionStrings:Postgres is not configured.");
    }
}
