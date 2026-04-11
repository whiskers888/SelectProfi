using SelectProfi.backend.Application.Access;
using SelectProfi.backend.Application.Cqrs;

namespace SelectProfi.backend.Application.Candidates.MarkVacancyCandidateViewedByCustomer;

public sealed class MarkVacancyCandidateViewedByCustomerCommandHandler(
    IMarkVacancyCandidateViewedByCustomerPersistence persistence)
    : ICommandHandler<MarkVacancyCandidateViewedByCustomerCommand, MarkVacancyCandidateViewedByCustomerResult>
{
    public async Task<MarkVacancyCandidateViewedByCustomerResult> HandleAsync(
        MarkVacancyCandidateViewedByCustomerCommand command,
        CancellationToken cancellationToken)
    {
        var vacancy = await persistence.FindActiveVacancyByIdAsync(command.VacancyId, cancellationToken);
        if (vacancy is null)
        {
            return new MarkVacancyCandidateViewedByCustomerResult
            {
                ErrorCode = MarkVacancyCandidateViewedByCustomerErrorCode.VacancyNotFound
            };
        }

        if (!CandidateAccessRules.CanSelectVacancyCandidateByCustomer(
                command.RequesterRole,
                command.RequesterUserId,
                vacancy.CustomerId))
        {
            return new MarkVacancyCandidateViewedByCustomerResult
            {
                ErrorCode = MarkVacancyCandidateViewedByCustomerErrorCode.Forbidden
            };
        }

        var vacancyCandidate = await persistence.FindActiveVacancyCandidateAsync(
            command.VacancyId,
            command.CandidateId,
            cancellationToken);
        if (vacancyCandidate is null)
        {
            return new MarkVacancyCandidateViewedByCustomerResult
            {
                ErrorCode = MarkVacancyCandidateViewedByCustomerErrorCode.CandidateLinkNotFound
            };
        }

        if (vacancyCandidate.ViewedByCustomerAtUtc is null)
        {
            vacancyCandidate.ViewedByCustomerAtUtc = DateTime.UtcNow;

            var saveResult = await persistence.SaveChangesAsync(cancellationToken);
            if (saveResult == MarkVacancyCandidateViewedByCustomerPersistenceResult.Conflict)
            {
                return new MarkVacancyCandidateViewedByCustomerResult
                {
                    ErrorCode = MarkVacancyCandidateViewedByCustomerErrorCode.Conflict
                };
            }
        }

        return new MarkVacancyCandidateViewedByCustomerResult
        {
            ErrorCode = MarkVacancyCandidateViewedByCustomerErrorCode.None
        };
    }
}
