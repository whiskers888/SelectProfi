using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;

namespace SelectProfi.backend.Infrastructure.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // @dvnull: Добавлен отдельный контур Order как источник требований и назначений исполнителя.
    public DbSet<Order> Orders => Set<Order>();

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
        });

        modelBuilder.Entity<Vacancy>(builder =>
        {
            builder.HasKey(vacancy => vacancy.Id);

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

            builder.HasIndex(vacancy => vacancy.OrderId)
                .HasFilter("\"DeletedAtUtc\" IS NULL")
                .IsUnique();
            builder.HasIndex(vacancy => new { vacancy.CustomerId, vacancy.DeletedAtUtc });
            builder.HasIndex(vacancy => new { vacancy.ExecutorId, vacancy.DeletedAtUtc });
        });

        base.OnModelCreating(modelBuilder);
    }
}
