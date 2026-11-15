using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.GetSelectedCandidateContacts;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.GetSelectedCandidateContacts;

public sealed class GetSelectedCandidateContactsPersistence(AppDbContext dbContext)
    : IGetSelectedCandidateContactsPersistence
{
    public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken)
    {
        return dbContext.Vacancies
            .AsNoTracking()
            .FirstOrDefaultAsync(vacancy => vacancy.Id == vacancyId && vacancy.DeletedAtUtc == null, cancellationToken);
    }

    public Task<Candidate?> FindActiveSubmittedCandidateAsync(
        Guid vacancyId,
        Guid candidateId,
        CancellationToken cancellationToken)
    {
        return dbContext.Candidates
            .AsNoTracking()
            .FirstOrDefaultAsync(
                candidate => candidate.Id == candidateId
                             && candidate.DeletedAtUtc == null
                             && dbContext.VacancyCandidates.Any(link =>
                                 link.VacancyId == vacancyId
                                 && link.CandidateId == candidate.Id
                                 && link.DeletedAtUtc == null
                                 && link.CustomerSubmittedAtUtc != null),
                cancellationToken);
    }
}
