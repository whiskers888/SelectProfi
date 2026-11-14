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
                UnreadNotificationsCount = dbContext.Notifications.Count(notification =>
                    notification.UserId == user.Id && notification.ReadAtUtc == null)
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (applicant is null)
        {
            return new ApplicantDashboardStatsSnapshot();
        }

        var activeApplicantLinks = dbContext.VacancyCandidates
            .AsNoTracking()
            .Where(link =>
                link.DeletedAtUtc == null &&
                link.Candidate.DeletedAtUtc == null &&
                link.Candidate.UserId == applicantUserId &&
                link.Vacancy.DeletedAtUtc == null);

        var applications = await activeApplicantLinks
            .Where(link => link.ApplicantSubmittedAtUtc != null)
            .OrderByDescending(link => link.ApplicantSubmittedAtUtc)
            .Select(link => new ApplicantDashboardApplicationSnapshot
            {
                VacancyId = link.VacancyId,
                VacancyTitle = link.Vacancy.Title,
                CompanyName = link.Vacancy.Customer.CustomerCompanyName,
                Stage = link.Stage,
                SubmittedAtUtc = link.ApplicantSubmittedAtUtc!.Value,
                FirstViewedAtUtc = link.ViewedByCustomerAtUtc
            })
            .ToListAsync(cancellationToken);

        var unclassifiedCandidateLinksCount = await activeApplicantLinks
            .CountAsync(link => link.ApplicantSubmittedAtUtc == null, cancellationToken);

        return new ApplicantDashboardStatsSnapshot
        {
            ApplicationsCount = applications.Count,
            UnclassifiedCandidateLinksCount = unclassifiedCandidateLinksCount,
            ShortlistCandidatesCount = applications.Count(application =>
                application.Stage == VacancyCandidateStage.Shortlist),
            UnreadNotificationsCount = applicant.UnreadNotificationsCount,
            ResumeTitle = applicant.ApplicantResumeTitle,
            Applications = applications
        };
    }
}
