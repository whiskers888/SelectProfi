using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Application.Dashboard.GetApplicantDashboardStats;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Infrastructure.Data;

namespace SelectProfi.backend.Infrastructure.Dashboard.GetApplicantDashboardStats;

public sealed class GetApplicantDashboardStatsPersistence(AppDbContext dbContext)
    : IGetApplicantDashboardStatsPersistence
{
    public async Task<ApplicantDashboardStatsSnapshot> GetApplicantStatsAsync(
        Guid applicantUserId,
        CancellationToken cancellationToken)
    {
        var applicant = await dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == applicantUserId && user.Role == UserRole.Applicant)
            .Select(user => new
            {
                user.ApplicantResumeTitle,
                ApplicationsCount = dbContext.VacancyCandidates.Count(link =>
                    link.DeletedAtUtc == null &&
                    link.Candidate.DeletedAtUtc == null &&
                    link.Candidate.UserId == user.Id &&
                    link.Vacancy.DeletedAtUtc == null),
                ShortlistCandidatesCount = dbContext.VacancyCandidates.Count(link =>
                    link.DeletedAtUtc == null &&
                    link.Stage == VacancyCandidateStage.Shortlist &&
                    link.Candidate.DeletedAtUtc == null &&
                    link.Candidate.UserId == user.Id &&
                    link.Vacancy.DeletedAtUtc == null),
                UnreadNotificationsCount = dbContext.Notifications.Count(notification =>
                    notification.UserId == user.Id && notification.ReadAtUtc == null)
            })
            .SingleOrDefaultAsync(cancellationToken);

        return applicant is null
            ? new ApplicantDashboardStatsSnapshot()
            : new ApplicantDashboardStatsSnapshot
            {
                ApplicationsCount = applicant.ApplicationsCount,
                ShortlistCandidatesCount = applicant.ShortlistCandidatesCount,
                UnreadNotificationsCount = applicant.UnreadNotificationsCount,
                ResumeTitle = applicant.ApplicantResumeTitle
            };
    }
}
