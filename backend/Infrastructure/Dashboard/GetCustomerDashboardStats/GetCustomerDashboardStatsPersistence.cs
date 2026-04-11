using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Dashboard.GetCustomerDashboardStats;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Dashboard.GetCustomerDashboardStats;

public sealed class GetCustomerDashboardStatsPersistence(AppDbContext dbContext) : IGetCustomerDashboardStatsPersistence
{
    public async Task<CustomerDashboardStatsSnapshot> GetCustomerStatsAsync(
        Guid customerUserId,
        CancellationToken cancellationToken)
    {
        var activeProjectsCount = await dbContext.Orders
            .AsNoTracking()
            .CountAsync(
                order =>
                    order.DeletedAtUtc == null &&
                    order.CustomerId == customerUserId &&
                    order.Status == OrderStatus.Active,
                cancellationToken);

        var onApprovalVacanciesCount = await dbContext.Vacancies
            .AsNoTracking()
            .CountAsync(
                vacancy =>
                    vacancy.DeletedAtUtc == null &&
                    vacancy.CustomerId == customerUserId &&
                    vacancy.Status == VacancyStatus.OnApproval,
                cancellationToken);

        var pipelineCandidatesCount = await dbContext.VacancyCandidates
            .AsNoTracking()
            .Join(
                dbContext.Vacancies.AsNoTracking(),
                vacancyCandidate => vacancyCandidate.VacancyId,
                vacancy => vacancy.Id,
                (vacancyCandidate, vacancy) => new { vacancyCandidate, vacancy })
            .CountAsync(
                pair =>
                    pair.vacancyCandidate.DeletedAtUtc == null &&
                    pair.vacancy.DeletedAtUtc == null &&
                    pair.vacancy.CustomerId == customerUserId,
                cancellationToken);

        var shortlistCandidatesCount = await dbContext.VacancyCandidates
            .AsNoTracking()
            .Join(
                dbContext.Vacancies.AsNoTracking(),
                vacancyCandidate => vacancyCandidate.VacancyId,
                vacancy => vacancy.Id,
                (vacancyCandidate, vacancy) => new { vacancyCandidate, vacancy })
            .CountAsync(
                pair =>
                    pair.vacancyCandidate.DeletedAtUtc == null &&
                    pair.vacancy.DeletedAtUtc == null &&
                    pair.vacancy.CustomerId == customerUserId &&
                    pair.vacancyCandidate.Stage == VacancyCandidateStage.Shortlist,
                cancellationToken);

        return new CustomerDashboardStatsSnapshot
        {
            ActiveProjectsCount = activeProjectsCount,
            PipelineCandidatesCount = pipelineCandidatesCount,
            ShortlistCandidatesCount = shortlistCandidatesCount,
            OnApprovalVacanciesCount = onApprovalVacanciesCount
        };
    }
}
