using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Infrastructure.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // @dvnull: Добавлен отдельный контур Order как источник требований и назначений исполнителя.
    public DbSet<Order> Orders => Set<Order>();

    public DbSet<Candidate> Candidates => Set<Candidate>();

    public DbSet<CandidateResume> CandidateResumes => Set<CandidateResume>();

    public DbSet<VacancyCandidate> VacancyCandidates => Set<VacancyCandidate>();

    public DbSet<User> Users => Set<User>();

    public DbSet<RefreshSession> RefreshSessions => Set<RefreshSession>();

    // @dvnull: Ранее контекст содержал только Users/RefreshSessions; добавлен Vacancy DbSet для PRI-74.
    public DbSet<Vacancy> Vacancies => Set<Vacancy>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // @dvnull: Ранее использовался ApplyConfigurationsFromAssembly; настройки перенесены в контекст, чтобы убрать отдельные Configuration-классы.
        modelBuilder.Entity<User>(builder =>
        {
            builder.HasKey(user => user.Id);
            builder.Property(user => user.Id).ValueGeneratedNever();

            builder.Property(user => user.Email).HasMaxLength(254).IsRequired();
            builder.Property(user => user.NormalizedEmail).HasMaxLength(254).IsRequired();
            builder.Property(user => user.Phone).HasMaxLength(16);
            builder.Property(user => user.NormalizedPhone).HasMaxLength(16);
            builder.Property(user => user.PasswordHash).HasMaxLength(512).IsRequired();
            builder.Property(user => user.FirstName).HasMaxLength(100).IsRequired();
            builder.Property(user => user.LastName).HasMaxLength(100).IsRequired();
            builder.Property(user => user.Role).HasConversion<string>().HasMaxLength(32).IsRequired();
            builder.Property(user => user.ApplicantResumeTitle).HasMaxLength(200);
            builder.Property(user => user.ApplicantPreviousCompanyName).HasMaxLength(200);
            builder.Property(user => user.ApplicantWorkPeriod).HasMaxLength(100);
            builder.Property(user => user.ApplicantExperienceSummary).HasMaxLength(2000);
            builder.Property(user => user.ApplicantAchievements).HasMaxLength(2000);
            builder.Property(user => user.ApplicantEducation).HasMaxLength(1000);
            builder.Property(user => user.ApplicantSkills).HasMaxLength(4000);
            builder.Property(user => user.ApplicantCertificates).HasMaxLength(4000);
            builder.Property(user => user.ApplicantPortfolioUrl).HasMaxLength(512);
            builder.Property(user => user.ApplicantAbout).HasMaxLength(2000);
            builder.Property(user => user.ApplicantDesiredSalary).HasPrecision(18, 2);
            builder.Property(user => user.CustomerInn).HasMaxLength(12);
            builder.Property(user => user.CustomerLegalForm).HasConversion<string>().HasMaxLength(16);
            builder.Property(user => user.CustomerEgrn).HasMaxLength(13);
            builder.Property(user => user.CustomerEgrnip).HasMaxLength(15);
            builder.Property(user => user.CustomerCompanyName).HasMaxLength(255);
            builder.Property(user => user.CustomerCompanyLogoUrl).HasMaxLength(512);
            builder.Property(user => user.CustomerOfferVersion).HasMaxLength(100);
            builder.Property(user => user.ExecutorEmploymentType).HasConversion<string>().HasMaxLength(16);
            builder.Property(user => user.ExecutorProjectTitle).HasMaxLength(200);
            builder.Property(user => user.ExecutorProjectCompanyName).HasMaxLength(200);
            builder.Property(user => user.ExecutorExperienceSummary).HasMaxLength(2000);
            builder.Property(user => user.ExecutorAchievements).HasMaxLength(2000);
            builder.Property(user => user.ExecutorCertificates).HasMaxLength(4000);
            builder.Property(user => user.ExecutorGrade).HasMaxLength(50);
            builder.Property(user => user.ExecutorExtraInfo).HasMaxLength(2000);

            builder.HasIndex(user => user.NormalizedEmail).IsUnique();
            builder.HasIndex(user => user.NormalizedPhone).IsUnique();
        });

        modelBuilder.Entity<RefreshSession>(builder =>
        {
            builder.HasKey(session => session.Id);
            builder.Property(session => session.TokenHash).HasMaxLength(128).IsRequired();

            builder.HasIndex(session => session.TokenHash).IsUnique();
            builder.HasIndex(session => session.UserId);

            builder.HasOne(session => session.User)
                .WithMany(user => user.RefreshSessions)
                .HasForeignKey(session => session.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Order>(builder =>
        {
            builder.HasKey(order => order.Id);

            // @dvnull: Добавлен статус жизненного цикла заказа для бизнес-действий "active/paused".
            builder.Property(order => order.Status)
                .HasConversion<string>()
                .HasMaxLength(32)
                .HasDefaultValue(OrderStatus.Active)
                .IsRequired();

            builder.HasOne(order => order.Customer)
                .WithMany()
                .HasForeignKey(order => order.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(order => order.Executor)
                .WithMany()
                .HasForeignKey(order => order.ExecutorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(order => new { order.CustomerId, order.DeletedAtUtc });
            builder.HasIndex(order => new { order.ExecutorId, order.DeletedAtUtc });
            builder.HasIndex(order => new { order.Status, order.DeletedAtUtc });
        });

        modelBuilder.Entity<Vacancy>(builder =>
        {
            builder.HasKey(vacancy => vacancy.Id);

            // @dvnull: Ранее статус жизненного цикла вакансии не хранился; добавлен enum-статус для draft/approval/published.
            builder.Property(vacancy => vacancy.Status)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            builder.HasOne(vacancy => vacancy.Order)
                .WithMany()
                .HasForeignKey(vacancy => vacancy.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(vacancy => vacancy.Customer)
                .WithMany()
                .HasForeignKey(vacancy => vacancy.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(vacancy => vacancy.Executor)
                .WithMany()
                .HasForeignKey(vacancy => vacancy.ExecutorId)
                .OnDelete(DeleteBehavior.Restrict);

            // @dvnull: Добавлена FK-связь финального выбранного кандидата в вакансии.
            builder.HasOne(vacancy => vacancy.SelectedCandidate)
                .WithMany()
                .HasForeignKey(vacancy => vacancy.SelectedCandidateId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(vacancy => vacancy.OrderId)
                .HasFilter("\"DeletedAtUtc\" IS NULL")
                .IsUnique();
            builder.HasIndex(vacancy => new { vacancy.CustomerId, vacancy.DeletedAtUtc });
            builder.HasIndex(vacancy => new { vacancy.ExecutorId, vacancy.DeletedAtUtc });
            builder.HasIndex(vacancy => vacancy.SelectedCandidateId);
            builder.HasIndex(vacancy => new { vacancy.Status, vacancy.DeletedAtUtc });
        });

        modelBuilder.Entity<Candidate>(builder =>
        {
            builder.HasKey(candidate => candidate.Id);

            // @dvnull: Ранее матчинга и обезличенного alias в Candidate не было; добавлено для безопасного merge и скрытия ФИО.
            builder.Property(candidate => candidate.NormalizedFullName)
                .HasMaxLength(200)
                .IsRequired();
            builder.Property(candidate => candidate.PublicAlias)
                .HasMaxLength(200)
                .IsRequired();
            builder.Property(candidate => candidate.NormalizedEmail)
                .HasMaxLength(254);
            builder.Property(candidate => candidate.NormalizedPhone)
                .HasMaxLength(32);

            builder.Property(candidate => candidate.Source)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            builder.HasOne(candidate => candidate.User)
                .WithMany()
                .HasForeignKey(candidate => candidate.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(candidate => candidate.CreatedByExecutor)
                .WithMany()
                .HasForeignKey(candidate => candidate.CreatedByExecutorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(candidate => candidate.ContactsOwnerExecutor)
                .WithMany()
                .HasForeignKey(candidate => candidate.ContactsOwnerExecutorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(candidate => candidate.UserId)
                .HasFilter("\"DeletedAtUtc\" IS NULL AND \"UserId\" IS NOT NULL")
                .IsUnique();
            builder.HasIndex(candidate => new { candidate.CreatedByExecutorId, candidate.DeletedAtUtc });
            builder.HasIndex(candidate => new
                { candidate.NormalizedFullName, candidate.BirthDate, candidate.DeletedAtUtc });
            builder.HasIndex(candidate => candidate.NormalizedEmail)
                .HasFilter("\"DeletedAtUtc\" IS NULL AND \"NormalizedEmail\" IS NOT NULL");
            builder.HasIndex(candidate => candidate.NormalizedPhone)
                .HasFilter("\"DeletedAtUtc\" IS NULL AND \"NormalizedPhone\" IS NOT NULL");
            builder.HasIndex(candidate => new
                { candidate.ContactsOwnerExecutorId, candidate.ContactsAccessExpiresAtUtc, candidate.DeletedAtUtc });
        });

        modelBuilder.Entity<CandidateResume>(builder =>
        {
            builder.HasKey(resume => resume.Id);

            builder.HasOne(resume => resume.Candidate)
                .WithMany(candidate => candidate.Resumes)
                .HasForeignKey(resume => resume.CandidateId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(resume => resume.OwnerUser)
                .WithMany()
                .HasForeignKey(resume => resume.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(resume => new { resume.CandidateId, resume.DeletedAtUtc });
            builder.HasIndex(resume => new { resume.OwnerUserId, resume.DeletedAtUtc });
        });

        modelBuilder.Entity<VacancyCandidate>(builder =>
        {
            builder.HasKey(vacancyCandidate => vacancyCandidate.Id);

            builder.Property(vacancyCandidate => vacancyCandidate.Stage)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            builder.HasOne(vacancyCandidate => vacancyCandidate.Vacancy)
                .WithMany(vacancy => vacancy.VacancyCandidates)
                .HasForeignKey(vacancyCandidate => vacancyCandidate.VacancyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(vacancyCandidate => vacancyCandidate.Candidate)
                .WithMany(candidate => candidate.VacancyLinks)
                .HasForeignKey(vacancyCandidate => vacancyCandidate.CandidateId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(vacancyCandidate => vacancyCandidate.AddedByExecutor)
                .WithMany()
                .HasForeignKey(vacancyCandidate => vacancyCandidate.AddedByExecutorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(vacancyCandidate => new
                { vacancyCandidate.VacancyId, vacancyCandidate.CandidateId })
                .HasFilter("\"DeletedAtUtc\" IS NULL")
                .IsUnique();
            builder.HasIndex(vacancyCandidate => new
                { vacancyCandidate.VacancyId, vacancyCandidate.Stage, vacancyCandidate.DeletedAtUtc });
            builder.HasIndex(vacancyCandidate => new
                { vacancyCandidate.CandidateId, vacancyCandidate.DeletedAtUtc });
        });

        base.OnModelCreating(modelBuilder);
    }
}
