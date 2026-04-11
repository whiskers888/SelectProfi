using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Dashboard.GetExecutorDashboardStats;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Dashboard.GetExecutorDashboardStats;

public sealed class GetExecutorDashboardStatsPersistence(AppDbContext dbContext) : IGetExecutorDashboardStatsPersistence
{
    public async Task<ExecutorDashboardStatsSnapshot> GetExecutorStatsAsync(
        Guid executorUserId,
        CancellationToken cancellationToken)
    {
        var activeProjectsCount = await dbContext.Orders
            .AsNoTracking()
            .CountAsync(
                order =>
                    order.DeletedAtUtc == null &&
                    order.ExecutorId == executorUserId &&
                    order.Status == OrderStatus.Active,
                cancellationToken);

        var onApprovalVacanciesCount = await dbContext.Vacancies
            .AsNoTracking()
            .CountAsync(
                vacancy =>
                    vacancy.DeletedAtUtc == null &&
                    vacancy.ExecutorId == executorUserId &&
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
                    pair.vacancy.ExecutorId == executorUserId,
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
                    pair.vacancy.ExecutorId == executorUserId &&
                    pair.vacancyCandidate.Stage == VacancyCandidateStage.Shortlist,
                cancellationToken);

        return new ExecutorDashboardStatsSnapshot
        {
            ActiveProjectsCount = activeProjectsCount,
            PipelineCandidatesCount = pipelineCandidatesCount,
            ShortlistCandidatesCount = shortlistCandidatesCount,
            OnApprovalVacanciesCount = onApprovalVacanciesCount
        };
    }
}
