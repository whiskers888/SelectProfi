using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;
using System.Text.Json;

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

        Vacancy? vacancy = null;
        if (command.VacancyId.HasValue)
        {
            vacancy = await persistence.FindActiveVacancyByIdAsync(command.VacancyId.Value, cancellationToken);
            if (vacancy is null)
                return new CreateCandidateResumeResult { ErrorCode = CreateCandidateResumeErrorCode.VacancyNotFound };

            if (!CandidateAccessRules.CanManageVacancyCandidateByExecutor(command.RequesterRole, command.RequesterUserId, vacancy.ExecutorId))
                return new CreateCandidateResumeResult { ErrorCode = CreateCandidateResumeErrorCode.Forbidden };

            if (!CandidateAccessRules.CanMutateVacancyCandidatePipeline(vacancy.Status))
                return new CreateCandidateResumeResult { ErrorCode = CreateCandidateResumeErrorCode.VacancyNotPublished };
        }
        else if (command.RequesterRole != UserRole.Executor)
        {
            return new CreateCandidateResumeResult { ErrorCode = CreateCandidateResumeErrorCode.Forbidden };
        }

        var specialization = await persistence.FindActiveSpecializationByIdAsync(command.SpecializationId, cancellationToken);
        if (specialization is null)
            return new CreateCandidateResumeResult { ErrorCode = CreateCandidateResumeErrorCode.InvalidInput };

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
            PublicAlias = BuildPublicAlias(candidateId, specialization.Name),
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
            SpecializationId = specialization.Id,
            Title = NormalizeRequired(command.ResumeTitle),
            ContentJson = NormalizeJson(command.ResumeContentJson),
            AttachmentsJson = NormalizeOptional(command.ResumeAttachmentsJson),
            PdfExportAllowed = false,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        VacancyCandidate? vacancyCandidate = vacancy is null
            ? null
            : new VacancyCandidate
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
            VacancyCandidateId = vacancyCandidate?.Id ?? Guid.Empty,
            PublicAlias = candidate.PublicAlias,
            ContactsAccessExpiresAtUtc = contactsAccessExpiresAtUtc
        };
    }
    private static bool IsValid(CreateCandidateResumeCommand command)
    {
        return !string.IsNullOrWhiteSpace(command.FullName)
               && command.SpecializationId != Guid.Empty
               && !string.IsNullOrWhiteSpace(command.Phone)
               && !string.IsNullOrWhiteSpace(command.ResumeTitle)
               && HasResumeContent(command.ResumeContentJson)
               && HasValidAttachmentLinks(command.ResumeAttachmentsJson);
    }

    private static bool HasResumeContent(string value)
    {
        return !string.IsNullOrWhiteSpace(value) && value != "{}";
    }

    private static bool HasValidAttachmentLinks(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return true;
        try
        {
            using var document = JsonDocument.Parse(value);
            if (document.RootElement.ValueKind != JsonValueKind.Array)
                return false;

            foreach (var item in document.RootElement.EnumerateArray())
            {
                var link = item.ValueKind switch
                {
                    JsonValueKind.String => item.GetString(),
                    JsonValueKind.Object when item.TryGetProperty("url", out var url) && url.ValueKind == JsonValueKind.String
                        => url.GetString(),
                    _ => null
                };

                if (!Uri.TryCreate(link, UriKind.Absolute, out var uri) ||
                    (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
                    return false;
            }

            return true;
        }
        catch (JsonException) { return false; }
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
