using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.CreateCandidateResume;

public sealed class CreateCandidateResumeCommandHandler(ICreateCandidateResumePersistence persistence)
    : ICommandHandler<CreateCandidateResumeCommand, CreateCandidateResumeResult>
{
    private const int ContactsAccessDays = 180;

    private static readonly string[] AliasAdjectives =
    [
        "Неопознанный",
        "Системный",
        "Практичный",
        "Внимательный",
        "Сильный",
        "Точный",
        "Наблюдательный",
        "Путешествующий"
    ];

    public async Task<CreateCandidateResumeResult> HandleAsync(
        CreateCandidateResumeCommand command,
        CancellationToken cancellationToken)
    {
        if (!IsValid(command))
            return new CreateCandidateResumeResult { ErrorCode = CreateCandidateResumeErrorCode.InvalidInput };

        var vacancy = await persistence.FindActiveVacancyByIdAsync(command.VacancyId, cancellationToken);
        if (vacancy is null)
            return new CreateCandidateResumeResult { ErrorCode = CreateCandidateResumeErrorCode.VacancyNotFound };

        if (!CandidateAccessRules.CanManageVacancyCandidateByExecutor(command.RequesterRole, command.RequesterUserId, vacancy.ExecutorId))
            return new CreateCandidateResumeResult { ErrorCode = CreateCandidateResumeErrorCode.Forbidden };

        if (!CandidateAccessRules.CanMutateVacancyCandidatePipeline(vacancy.Status))
            return new CreateCandidateResumeResult { ErrorCode = CreateCandidateResumeErrorCode.VacancyNotPublished };

        var fullName = NormalizeRequired(command.FullName);
        var normalizedFullName = NormalizeFullName(fullName);
        var normalizedEmail = NormalizeEmail(command.Email);
        var normalizedPhone = NormalizePhone(command.Phone);
        var birthDate = command.BirthDate;
        var candidateExists = await persistence.CandidateIdentityExistsAsync(
            normalizedFullName,
            birthDate,
            normalizedEmail,
            normalizedPhone,
            cancellationToken);

        if (candidateExists)
            return new CreateCandidateResumeResult { ErrorCode = CreateCandidateResumeErrorCode.CandidateAlreadyExists };

        var utcNow = DateTime.UtcNow;
        var candidateId = Guid.NewGuid();
        var contactsAccessExpiresAtUtc = utcNow.AddDays(ContactsAccessDays);
        var candidate = new Candidate
        {
            Id = candidateId,
            UserId = null,
            CreatedByExecutorId = command.RequesterUserId,
            FullName = fullName,
            NormalizedFullName = normalizedFullName,
            BirthDate = birthDate,
            PublicAlias = BuildPublicAlias(candidateId, command.Specialization),
            Email = NormalizeOptional(command.Email),
            NormalizedEmail = normalizedEmail,
            Phone = NormalizeOptional(command.Phone),
            NormalizedPhone = normalizedPhone,
            ContactsOwnerExecutorId = command.RequesterUserId,
            ContactsAccessExpiresAtUtc = contactsAccessExpiresAtUtc,
            Source = CandidateSource.AddedByExecutor,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        var resume = new CandidateResume
        {
            Id = Guid.NewGuid(),
            CandidateId = candidate.Id,
            OwnerUserId = command.RequesterUserId,
            Title = NormalizeRequired(command.ResumeTitle),
            ContentJson = NormalizeJson(command.ResumeContentJson),
            AttachmentsJson = NormalizeOptional(command.ResumeAttachmentsJson),
            PdfExportAllowed = false,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        var vacancyCandidate = new VacancyCandidate
        {
            Id = Guid.NewGuid(),
            VacancyId = vacancy.Id,
            CandidateId = candidate.Id,
            AddedByExecutorId = command.RequesterUserId,
            Stage = VacancyCandidateStage.Pool,
            AddedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        var persistenceResult = await persistence.CreateAsync(candidate, resume, vacancyCandidate, cancellationToken);
        if (persistenceResult == CreateCandidateResumePersistenceResult.Conflict)
            return new CreateCandidateResumeResult { ErrorCode = CreateCandidateResumeErrorCode.Conflict };

        return new CreateCandidateResumeResult
        {
            ErrorCode = CreateCandidateResumeErrorCode.None,
            CandidateId = candidate.Id,
            CandidateResumeId = resume.Id,
            VacancyCandidateId = vacancyCandidate.Id,
            PublicAlias = candidate.PublicAlias,
            ContactsAccessExpiresAtUtc = contactsAccessExpiresAtUtc
        };
    }
    private static bool IsValid(CreateCandidateResumeCommand command)
    {
        return !string.IsNullOrWhiteSpace(command.FullName)
               && !string.IsNullOrWhiteSpace(command.Specialization)
               && !string.IsNullOrWhiteSpace(command.ResumeTitle);
    }

    private static string NormalizeRequired(string value)
    {
        return CollapseWhitespace(value.Trim());
    }

    private static string? NormalizeOptional(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return CollapseWhitespace(value.Trim());
    }

    private static string NormalizeFullName(string fullName)
    {
        return fullName.ToUpperInvariant();
    }

    private static string? NormalizeEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;

        return email.Trim().ToUpperInvariant();
    }

    private static string? NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return null;

        var normalizedChars = phone.Trim().Where(char.IsDigit).ToArray();
        if (normalizedChars.Length == 0)
            return null;

        return new string(normalizedChars);
    }

    private static string NormalizeJson(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return "{}";

        return value.Trim();
    }

    private static string BuildPublicAlias(Guid candidateId, string specialization)
    {
        var adjectiveIndex = candidateId.ToByteArray()[0] % AliasAdjectives.Length;
        var normalizedSpecialization = NormalizeRequired(specialization).ToLowerInvariant();
        return $"{AliasAdjectives[adjectiveIndex]} {normalizedSpecialization}";
    }

    private static string CollapseWhitespace(string value)
    {
        return string.Join(' ', value.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
    }
}
