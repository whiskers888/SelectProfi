using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Candidates;

namespace SelectProfi.backend.Application.Candidates.RespondToVacancy;

public sealed class RespondToVacancyCommandHandler(IRespondToVacancyPersistence persistence)
    : ICommandHandler<RespondToVacancyCommand, RespondToVacancyResult>
{
    public async Task<RespondToVacancyResult> HandleAsync(
        RespondToVacancyCommand command,
        CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveVacancyByIdAsync(command.VacancyId, cancellationToken);
        if (vacancy is null)
            return new RespondToVacancyResult { ErrorCode = RespondToVacancyErrorCode.VacancyNotFound };

        // @dvnull: Ранее Applicant не имел backend-сценария отклика на вакансию; добавлена строгая role-проверка на уровне use-case.
        if (!CandidateAccessRules.CanRespondToVacancyByApplicant(command.RequesterRole))
            return new RespondToVacancyResult { ErrorCode = RespondToVacancyErrorCode.Forbidden };

        if (!CandidateAccessRules.CanMutateVacancyCandidatePipeline(vacancy.Status))
            return new RespondToVacancyResult { ErrorCode = RespondToVacancyErrorCode.VacancyNotPublished };

        var applicant = await persistence.FindApplicantByIdAsync(command.RequesterUserId, cancellationToken);
        if (applicant is null)
            return new RespondToVacancyResult { ErrorCode = RespondToVacancyErrorCode.ApplicantNotFound };

        var utcNow = DateTime.UtcNow;
        var candidate = await persistence.FindActiveRegisteredCandidateByUserIdAsync(applicant.Id, cancellationToken);
        Candidate? candidateToCreate = null;
        if (candidate is null)
        {
            candidateToCreate = BuildRegisteredCandidate(applicant, utcNow);
            candidate = candidateToCreate;
        }

        var alreadyLinked = await persistence.VacancyCandidateLinkExistsAsync(vacancy.Id, candidate.Id, cancellationToken);
        if (alreadyLinked)
            return new RespondToVacancyResult { ErrorCode = RespondToVacancyErrorCode.AlreadyResponded };

        var vacancyCandidate = new VacancyCandidate
        {
            Id = Guid.NewGuid(),
            VacancyId = vacancy.Id,
            CandidateId = candidate.Id,
            AddedByExecutorId = vacancy.ExecutorId,
            Stage = VacancyCandidateStage.Pool,
            AddedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        var createResult = await persistence.CreateAsync(candidateToCreate, vacancyCandidate, cancellationToken);
        if (createResult == RespondToVacancyPersistenceResult.Conflict)
            return new RespondToVacancyResult { ErrorCode = RespondToVacancyErrorCode.Conflict };

        return new RespondToVacancyResult
        {
            ErrorCode = RespondToVacancyErrorCode.None,
            VacancyCandidateId = vacancyCandidate.Id,
            VacancyId = vacancyCandidate.VacancyId,
            CandidateId = vacancyCandidate.CandidateId,
            Stage = vacancyCandidate.Stage,
            AddedAtUtc = vacancyCandidate.AddedAtUtc,
            UpdatedAtUtc = vacancyCandidate.UpdatedAtUtc
        };
    }

    private static Candidate BuildRegisteredCandidate(Domain.Users.User applicant, DateTime utcNow)
    {
        var fullName = BuildFullName(applicant);
        var normalizedFullName = fullName.ToUpperInvariant();

        return new Candidate
        {
            Id = Guid.NewGuid(),
            UserId = applicant.Id,
            CreatedByExecutorId = null,
            FullName = fullName,
            NormalizedFullName = normalizedFullName,
            BirthDate = null,
            PublicAlias = fullName,
            Email = applicant.Email,
            NormalizedEmail = applicant.NormalizedEmail,
            Phone = applicant.Phone,
            NormalizedPhone = applicant.NormalizedPhone,
            ContactsOwnerExecutorId = null,
            ContactsAccessExpiresAtUtc = null,
            Source = CandidateSource.RegisteredUser,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };
    }

    private static string BuildFullName(Domain.Users.User applicant)
    {
        var fullName = $"{applicant.FirstName} {applicant.LastName}".Trim();
        if (!string.IsNullOrWhiteSpace(fullName))
            return fullName;

        return applicant.Email;
    }
}

