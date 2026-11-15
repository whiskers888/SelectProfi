using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Application.Candidates.GetVacancyCandidates;

public sealed class GetVacancyCandidatesQueryHandler(IGetVacancyCandidatesPersistence persistence)
    : IQueryHandler<GetVacancyCandidatesQuery, GetVacancyCandidatesResult>
{
    public async Task<GetVacancyCandidatesResult> HandleAsync(
        GetVacancyCandidatesQuery query,
        CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveVacancyByIdAsync(query.VacancyId, cancellationToken);
        if (vacancy is null)
        {
            return new GetVacancyCandidatesResult
            {
                ErrorCode = GetVacancyCandidatesErrorCode.VacancyNotFound
            };
        }

        if (!CandidateAccessRules.CanReadVacancyCandidates(
                query.RequesterRole,
                query.RequesterUserId,
                vacancy.CustomerId,
                vacancy.ExecutorId))
        {
            return new GetVacancyCandidatesResult
            {
                ErrorCode = GetVacancyCandidatesErrorCode.Forbidden
            };
        }

        var vacancyCandidates = await persistence.FindActiveVacancyCandidatesAsync(query.VacancyId, cancellationToken);
        if (query.RequesterRole == UserRole.Customer)
            vacancyCandidates = vacancyCandidates.Where(candidate => candidate.CustomerSubmittedAtUtc is not null).ToArray();

        var selectedCandidateId = vacancy.SelectedCandidateId;
        var items = vacancyCandidates
            .Select(vacancyCandidate => new GetVacancyCandidatesItemResult
            {
                VacancyCandidateId = vacancyCandidate.Id,
                CandidateId = vacancyCandidate.CandidateId,
                PublicAlias = ResolvePublicAlias(vacancyCandidate.Candidate, query.RequesterRole),
                DisplayName = ResolveDisplayName(vacancyCandidate.Candidate, query.RequesterRole, query.RequesterUserId),
                Source = vacancyCandidate.Candidate.Source,
                IsOwnedByRequester = IsOwnedByRequester(vacancyCandidate.Candidate, query.RequesterUserId),
                IsAnonymized = IsAnonymized(vacancyCandidate.Candidate, query.RequesterRole, query.RequesterUserId),
                Stage = vacancyCandidate.Stage,
                AddedAtUtc = vacancyCandidate.AddedAtUtc,
                UpdatedAtUtc = vacancyCandidate.UpdatedAtUtc,
                ViewedByCustomerAtUtc = vacancyCandidate.ViewedByCustomerAtUtc,
                IsSelected = selectedCandidateId == vacancyCandidate.CandidateId,
                ApplicantSubmittedAtUtc = query.RequesterRole == UserRole.Executor
                    ? vacancyCandidate.ApplicantSubmittedAtUtc
                    : null,
                IsCustomerSubmitted = vacancyCandidate.CustomerSubmittedAtUtc is not null,
                ExperienceSummary = query.RequesterRole == UserRole.Executor &&
                                    vacancyCandidate.ApplicantSubmittedAtUtc is not null
                    ? vacancyCandidate.Candidate.User?.ApplicantExperienceSummary
                    : null,
                ExperienceYears = vacancyCandidate.Candidate.Resumes
                    .Where(resume => resume.DeletedAtUtc == null)
                    .OrderByDescending(resume => resume.UpdatedAtUtc)
                    .Select(resume => resume.ExperienceYears)
                    .FirstOrDefault()
            })
            .ToArray();

        return new GetVacancyCandidatesResult
        {
            ErrorCode = GetVacancyCandidatesErrorCode.None,
            VacancyId = vacancy.Id,
            SelectedCandidateId = selectedCandidateId,
            Items = items
        };
    }

    private static bool IsOwnedByRequester(Domain.Candidates.Candidate candidate, Guid requesterUserId)
    {
        return candidate.CreatedByExecutorId == requesterUserId
               || candidate.ContactsOwnerExecutorId == requesterUserId;
    }

    private static bool IsAnonymized(Candidate candidate, UserRole requesterRole, Guid requesterUserId)
    {
        if (requesterRole == UserRole.Customer)
        {
            return true;
        }

        if (candidate.Source == CandidateSource.RegisteredUser)
        {
            return false;
        }

        return !IsOwnedByRequester(candidate, requesterUserId);
    }

    private static string ResolvePublicAlias(Candidate candidate, UserRole requesterRole)
    {
        if (requesterRole != UserRole.Customer)
        {
            return candidate.PublicAlias;
        }

        if (string.IsNullOrWhiteSpace(candidate.PublicAlias) ||
            string.Equals(candidate.PublicAlias, candidate.FullName, StringComparison.OrdinalIgnoreCase))
        {
            return CandidatePublicAlias.ForCandidate(candidate.Id);
        }

        return candidate.PublicAlias;
    }

    private static string ResolveDisplayName(Candidate candidate, UserRole requesterRole, Guid requesterUserId)
    {
        return IsAnonymized(candidate, requesterRole, requesterUserId)
            ? ResolvePublicAlias(candidate, requesterRole)
            : candidate.FullName;
    }
}
