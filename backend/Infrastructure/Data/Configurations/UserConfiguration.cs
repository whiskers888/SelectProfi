using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SelectProfi.backend.Domain.Users;

namespace SelectProfi.backend.Infrastructure.Data.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(user => user.Id);
        builder.Property(user => user.Id)
            .ValueGeneratedNever();

        builder.Property(user => user.Email)
            .HasMaxLength(254)
            .IsRequired();

        builder.Property(user => user.NormalizedEmail)
            .HasMaxLength(254)
            .IsRequired();

        builder.Property(user => user.Phone)
            .HasMaxLength(16);

        builder.Property(user => user.NormalizedPhone)
            .HasMaxLength(16);

        builder.Property(user => user.PasswordHash)
            .HasMaxLength(512)
            .IsRequired();

        builder.Property(user => user.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(user => user.LastName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(user => user.Role)
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(user => user.IsEmailVerified)
            .IsRequired();

        builder.Property(user => user.IsPhoneVerified)
            .IsRequired();

        builder.Property(user => user.CreatedAtUtc)
            .IsRequired();

        builder.Property(user => user.ApplicantResumeTitle)
            .HasMaxLength(200);

        builder.Property(user => user.ApplicantPreviousCompanyName)
            .HasMaxLength(200);

        builder.Property(user => user.ApplicantWorkPeriod)
            .HasMaxLength(100);

        builder.Property(user => user.ApplicantExperienceSummary)
            .HasMaxLength(2000);

        builder.Property(user => user.ApplicantAchievements)
            .HasMaxLength(2000);

        builder.Property(user => user.ApplicantEducation)
            .HasMaxLength(1000);

        builder.Property(user => user.ApplicantSkills)
            .HasMaxLength(4000);

        builder.Property(user => user.ApplicantCertificates)
            .HasMaxLength(4000);

        builder.Property(user => user.ApplicantPortfolioUrl)
            .HasMaxLength(512);

        builder.Property(user => user.ApplicantAbout)
            .HasMaxLength(2000);

        builder.Property(user => user.ApplicantDesiredSalary)
            .HasPrecision(18, 2);

        builder.Property(user => user.CustomerInn)
            .HasMaxLength(12);

        builder.Property(user => user.CustomerLegalForm)
            .HasConversion<string>()
            .HasMaxLength(16);

        builder.Property(user => user.CustomerEgrn)
            .HasMaxLength(13);

        builder.Property(user => user.CustomerEgrnip)
            .HasMaxLength(15);

        builder.Property(user => user.CustomerCompanyName)
            .HasMaxLength(255);

        builder.Property(user => user.CustomerCompanyLogoUrl)
            .HasMaxLength(512);

        builder.Property(user => user.CustomerOfferAccepted)
            .IsRequired();

        builder.Property(user => user.CustomerOfferVersion)
            .HasMaxLength(100);

        builder.Property(user => user.CustomerOfferAcceptedAtUtc);

        builder.Property(user => user.ExecutorEmploymentType)
            .HasConversion<string>()
            .HasMaxLength(16);

        builder.Property(user => user.ExecutorProjectTitle)
            .HasMaxLength(200);

        builder.Property(user => user.ExecutorProjectCompanyName)
            .HasMaxLength(200);

        builder.Property(user => user.ExecutorExperienceSummary)
            .HasMaxLength(2000);

        builder.Property(user => user.ExecutorAchievements)
            .HasMaxLength(2000);

        builder.Property(user => user.ExecutorCertificates)
            .HasMaxLength(4000);

        builder.Property(user => user.ExecutorGrade)
            .HasMaxLength(50);

        builder.Property(user => user.ExecutorExtraInfo)
            .HasMaxLength(2000);

        builder.HasIndex(user => user.NormalizedEmail)
            .IsUnique();

        builder.HasIndex(user => user.NormalizedPhone)
            .IsUnique();
    }
}
