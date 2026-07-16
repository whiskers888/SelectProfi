using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Candidates.RemoveVacancyCandidate;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Candidates.RemoveVacancyCandidate;

public sealed class RemoveVacancyCandidatePersistence(AppDbContext dbContext) : IRemoveVacancyCandidatePersistence
{
    public Task<Vacancy?> FindActiveVacancyByIdAsync(Guid vacancyId, CancellationToken cancellationToken) =>
        dbContext.Vacancies.FirstOrDefaultAsync(item => item.Id == vacancyId && item.DeletedAtUtc == null, cancellationToken);
    public Task<VacancyCandidate?> FindActiveLinkAsync(Guid vacancyId, Guid candidateId, CancellationToken cancellationToken) =>
        dbContext.VacancyCandidates.FirstOrDefaultAsync(item => item.VacancyId == vacancyId && item.CandidateId == candidateId && item.DeletedAtUtc == null, cancellationToken);
    public Task SaveChangesAsync(CancellationToken cancellationToken) => dbContext.SaveChangesAsync(cancellationToken);
}
