using Microsoft.EntityFrameworkCore;
using SelectProfi.backend.Domain.Candidates;
using SelectProfi.backend.Domain.Notifications;
using SelectProfi.backend.Domain.Orders;
using SelectProfi.backend.Domain.Users;
using SelectProfi.backend.Domain.Vacancies;
using SelectProfi.backend.Domain.Wallets;

namespace SelectProfi.backend.Infrastructure.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // @dvnull: Добавлен отдельный контур Order как источник требований и назначений исполнителя.
    public DbSet<Order> Orders => Set<Order>();
    // @dvnull: Добавлен справочник специализаций заказов для централизованной админ-настройки.
    public DbSet<OrderSpecialization> OrderSpecializations => Set<OrderSpecialization>();
    public DbSet<OrderExecutorResponse> OrderExecutorResponses => Set<OrderExecutorResponse>();
    public DbSet<OrderFavorite> OrderFavorites => Set<OrderFavorite>();
    public DbSet<OrderConversation> OrderConversations => Set<OrderConversation>();
    public DbSet<OrderChatMessage> OrderChatMessages => Set<OrderChatMessage>();
    public DbSet<OrderMeeting> OrderMeetings => Set<OrderMeeting>();
    public DbSet<ProjectActivity> ProjectActivities => Set<ProjectActivity>();
    public DbSet<ProjectDocument> ProjectDocuments => Set<ProjectDocument>();

    public DbSet<Candidate> Candidates => Set<Candidate>();

    public DbSet<CandidateResume> CandidateResumes => Set<CandidateResume>();

    public DbSet<CandidateResumeAttachment> CandidateResumeAttachments => Set<CandidateResumeAttachment>();

    public DbSet<VacancyCandidate> VacancyCandidates => Set<VacancyCandidate>();

    public DbSet<User> Users => Set<User>();

    public DbSet<RefreshSession> RefreshSessions => Set<RefreshSession>();

    public DbSet<VerificationChallenge> VerificationChallenges => Set<VerificationChallenge>();

    public DbSet<Wallet> Wallets => Set<Wallet>();

    public DbSet<Notification> Notifications => Set<Notification>();

    // @dvnull: Ранее контекст содержал только Users/RefreshSessions; добавлен Vacancy DbSet для PRI-74.
    public DbSet<Vacancy> Vacancies => Set<Vacancy>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // @dvnull: Ранее использовался ApplyConfigurationsFromAssembly; настройки перенесены в контекст, чтобы убрать отдельные Configuration-классы.
        modelBuilder.Entity<User>(builder =>
        {
            builder.HasKey(user => user.Id);
            builder.Property(user => user.Id).ValueGeneratedNever();

            builder.Property(user => user.Email).HasMaxLength(254);
            builder.Property(user => user.NormalizedEmail).HasMaxLength(254);
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
            builder.Property(user => user.ApplicantJobSearchStatus).HasMaxLength(32);
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
            builder.Property(user => user.ExecutorInn).HasMaxLength(12);
            builder.Property(user => user.ExecutorOgrnip).HasMaxLength(15);

            builder.HasIndex(user => user.NormalizedEmail)
                .IsUnique()
                .HasFilter("\"NormalizedEmail\" IS NOT NULL");
            builder.HasIndex(user => user.NormalizedPhone).IsUnique();
        });

        modelBuilder.Entity<VerificationChallenge>(builder =>
        {
            builder.HasKey(challenge => challenge.Id);
            builder.Property(challenge => challenge.Id).ValueGeneratedNever();

            builder.Property(challenge => challenge.Channel)
                .HasConversion<string>()
                .HasMaxLength(16)
                .IsRequired();
            builder.Property(challenge => challenge.Target).HasMaxLength(254).IsRequired();
            builder.Property(challenge => challenge.CodeHash).HasMaxLength(128).IsRequired();

            builder.HasIndex(challenge => new { challenge.Target, challenge.CreatedAtUtc });
            builder.HasIndex(challenge => challenge.ExpiresAtUtc);
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

        modelBuilder.Entity<Wallet>(builder =>
        {
            builder.HasKey(wallet => wallet.Id);
            builder.Property(wallet => wallet.AvailableBalance)
                .HasPrecision(18, 2)
                .HasDefaultValue(0m)
                .IsRequired();
            builder.Property(wallet => wallet.ReservedBalance)
                .HasPrecision(18, 2)
                .HasDefaultValue(0m)
                .IsRequired();
            builder.Property(wallet => wallet.CurrencyCode)
                .HasMaxLength(3)
                .HasDefaultValue("RUB")
                .IsRequired();

            builder.HasOne(wallet => wallet.User)
                .WithOne()
                .HasForeignKey<Wallet>(wallet => wallet.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Notification>(builder =>
        {
            builder.HasKey(notification => notification.Id);
            builder.Property(notification => notification.Title)
                .HasMaxLength(200)
                .IsRequired();
            builder.Property(notification => notification.Message)
                .HasMaxLength(1000)
                .IsRequired();

            builder.HasOne(notification => notification.User)
                .WithMany()
                .HasForeignKey(notification => notification.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(notification => new
                { notification.UserId, notification.ReadAtUtc, notification.CreatedAtUtc });
        });

        modelBuilder.Entity<Order>(builder =>
        {
            builder.HasKey(order => order.Id);
            // @dvnull: Ранее специализация/цена заказа не имели отдельных колонок; добавлены типизированные поля для структуры заказа в БД.
            builder.Property(order => order.Specialization)
                .HasMaxLength(200)
                .IsRequired();
            builder.Property(order => order.Price)
                .HasPrecision(18, 2)
                .IsRequired();
            builder.Property(order => order.ServiceCommissionRate)
                .HasPrecision(6, 5);
            builder.Property(order => order.CustomerCompanyName)
                .HasMaxLength(255);
            builder.Property(order => order.Location)
                .HasMaxLength(255)
                .IsRequired();
            builder.Property(order => order.EmployeeCompensation)
                .HasMaxLength(255)
                .IsRequired();
            builder.Property(order => order.Functional)
                .HasMaxLength(4000)
                .IsRequired();
            builder.Property(order => order.Requirements)
                .HasMaxLength(4000)
                .IsRequired();
            builder.Property(order => order.OtherConditions)
                .HasMaxLength(4000)
                .IsRequired();
            builder.Property(order => order.RequestedCandidatesCount)
                .HasDefaultValue(3)
                .IsRequired();

            // @dvnull: Добавлен статус жизненного цикла заказа для бизнес-действий "active/paused".
            builder.Property(order => order.Status)
                .HasConversion<string>()
                .HasMaxLength(32)
                .HasDefaultValue(OrderStatus.Active)
                .IsRequired();

            builder.Property(order => order.SalaryMin).HasPrecision(18, 2);
            builder.Property(order => order.SalaryMax).HasPrecision(18, 2);
            builder.Property(order => order.GuaranteeReward).HasPrecision(18, 2);

            builder.HasOne(order => order.Customer)
                .WithMany()
                .HasForeignKey(order => order.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(order => order.Executor)
                .WithMany()
                .HasForeignKey(order => order.ExecutorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(order => order.SpecializationDictionaryItem)
                .WithMany()
                .HasForeignKey(order => order.SpecializationId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(order => new { order.CustomerId, order.DeletedAtUtc });
            builder.HasIndex(order => new { order.ExecutorId, order.DeletedAtUtc });
            builder.HasIndex(order => order.SpecializationId);
            builder.HasIndex(order => new { order.Status, order.DeletedAtUtc });
            builder.HasIndex(order => order.DueDate);
        });

        modelBuilder.Entity<ProjectActivity>(builder =>
        {
            builder.HasKey(activity => activity.Id);
            builder.Property(activity => activity.Action).HasMaxLength(80).IsRequired();
            builder.Property(activity => activity.Description).HasMaxLength(500).IsRequired();
            builder.HasOne<Order>()
                .WithMany()
                .HasForeignKey(activity => activity.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasIndex(activity => new { activity.OrderId, activity.CreatedAtUtc });
        });

        // Conversation membership is a snapshot of the customer/executor pair for this
        // assignment. A later executor cannot inherit the previous executor's messages.
        modelBuilder.Entity<OrderConversation>(builder =>
        {
            builder.HasKey(conversation => conversation.Id);
            builder.Property(conversation => conversation.Id).ValueGeneratedNever();
            builder.HasOne(conversation => conversation.Order).WithMany().HasForeignKey(conversation => conversation.OrderId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(conversation => conversation.Customer).WithMany().HasForeignKey(conversation => conversation.CustomerId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(conversation => conversation.Executor).WithMany().HasForeignKey(conversation => conversation.ExecutorId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(conversation => new { conversation.OrderId, conversation.ExecutorId }).IsUnique();
            builder.HasIndex(conversation => conversation.CustomerId);
            builder.HasIndex(conversation => conversation.ExecutorId);
        });

        modelBuilder.Entity<OrderChatMessage>(builder =>
        {
            builder.HasKey(message => message.Id);
            builder.Property(message => message.Id).ValueGeneratedNever();
            builder.Property(message => message.Text).HasMaxLength(4000).IsRequired();
            builder.Property(message => message.AttachmentFileName).HasMaxLength(255);
            builder.Property(message => message.AttachmentContentType).HasMaxLength(128);
            builder.Property(message => message.AttachmentStorageKey).HasMaxLength(512);
            builder.HasOne(message => message.Conversation).WithMany().HasForeignKey(message => message.ConversationId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(message => message.Sender).WithMany().HasForeignKey(message => message.SenderUserId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(message => new { message.ConversationId, message.CreatedAtUtc });
        });

        modelBuilder.Entity<OrderMeeting>(builder =>
        {
            builder.HasKey(meeting => meeting.Id);
            builder.Property(meeting => meeting.Id).ValueGeneratedNever();
            builder.Property(meeting => meeting.Title).HasMaxLength(200).IsRequired();
            builder.Property(meeting => meeting.Format).HasConversion<string>().HasMaxLength(24).IsRequired();
            builder.Property(meeting => meeting.Note).HasMaxLength(1000).IsRequired();
            builder.HasOne(meeting => meeting.Order).WithMany().HasForeignKey(meeting => meeting.OrderId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(meeting => meeting.Customer).WithMany().HasForeignKey(meeting => meeting.CustomerId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(meeting => meeting.Executor).WithMany().HasForeignKey(meeting => meeting.ExecutorId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(meeting => meeting.CreatedBy).WithMany().HasForeignKey(meeting => meeting.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(meeting => new { meeting.CustomerId, meeting.StartsAtUtc });
            builder.HasIndex(meeting => new { meeting.ExecutorId, meeting.StartsAtUtc });
        });

        modelBuilder.Entity<ProjectDocument>(builder =>
        {
            builder.HasKey(document => document.Id);
            builder.Property(document => document.FileName).HasMaxLength(255).IsRequired();
            builder.Property(document => document.ContentType).HasMaxLength(128).IsRequired();
            builder.Property(document => document.StorageKey).HasMaxLength(512).IsRequired();
            builder.HasOne<Order>()
                .WithMany()
                .HasForeignKey(document => document.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasIndex(document => new { document.OrderId, document.CreatedAtUtc });
            builder.HasIndex(document => document.StorageKey).IsUnique();
        });

        modelBuilder.Entity<OrderSpecialization>(builder =>
        {
            // @dvnull: Добавлена inline-конфигурация справочника специализаций с уникальным именем и сортировкой.
            builder.HasKey(item => item.Id);
            builder.Property(item => item.Name)
                .HasMaxLength(200)
                .IsRequired();
            builder.Property(item => item.IsActive)
                .HasDefaultValue(true)
                .IsRequired();
            builder.Property(item => item.SortOrder)
                .HasDefaultValue(0)
                .IsRequired();

            builder.HasIndex(item => item.Name)
                .IsUnique();
            builder.HasIndex(item => new { item.IsActive, item.SortOrder, item.Name });
        });

        modelBuilder.Entity<OrderExecutorResponse>(builder =>
        {
            builder.HasKey(orderResponse => orderResponse.Id);
            builder.Property(orderResponse => orderResponse.Message).HasMaxLength(2000).IsRequired();

            builder.Property(orderResponse => orderResponse.Status)
                .HasConversion<string>()
                .HasMaxLength(32)
                .HasDefaultValue(OrderResponseStatus.Pending)
                .IsRequired();

            builder.HasOne(orderResponse => orderResponse.Order)
                .WithMany()
                .HasForeignKey(orderResponse => orderResponse.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(orderResponse => orderResponse.Executor)
                .WithMany()
                .HasForeignKey(orderResponse => orderResponse.ExecutorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(orderResponse => new { orderResponse.OrderId, orderResponse.ExecutorId })
                .IsUnique();
            builder.HasIndex(orderResponse => new { orderResponse.OrderId, orderResponse.Status });
            builder.HasIndex(orderResponse => new { orderResponse.ExecutorId, orderResponse.Status });
        });

        modelBuilder.Entity<OrderFavorite>(builder =>
        {
            builder.HasKey(favorite => new { favorite.OrderId, favorite.ExecutorId });
            builder.HasOne(favorite => favorite.Order).WithMany().HasForeignKey(favorite => favorite.OrderId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(favorite => favorite.Executor).WithMany().HasForeignKey(favorite => favorite.ExecutorId).OnDelete(DeleteBehavior.Cascade);
            builder.HasIndex(favorite => favorite.ExecutorId);
        });

        modelBuilder.Entity<Vacancy>(builder =>
        {
            builder.HasKey(vacancy => vacancy.Id);

            builder.Property(vacancy => vacancy.CandidatePipelineRevision)
                .IsConcurrencyToken();

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

            builder.HasOne(resume => resume.Specialization)
                .WithMany()
                .HasForeignKey(resume => resume.SpecializationId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(resume => new { resume.CandidateId, resume.DeletedAtUtc });
            builder.HasIndex(resume => new { resume.OwnerUserId, resume.DeletedAtUtc });
            builder.HasIndex(resume => resume.SpecializationId);
        });

        modelBuilder.Entity<CandidateResumeAttachment>(builder =>
        {
            builder.HasKey(attachment => attachment.Id);
            builder.Property(attachment => attachment.OriginalFileName).HasMaxLength(255).IsRequired();
            builder.Property(attachment => attachment.StoredFileName).HasMaxLength(255).IsRequired();
            builder.Property(attachment => attachment.ContentType).HasMaxLength(128).IsRequired();
            builder.Property(attachment => attachment.AttachmentType).HasMaxLength(64).IsRequired();
            builder.Property(attachment => attachment.CustomType).HasMaxLength(128);
            builder.HasOne(attachment => attachment.CandidateResume)
                .WithMany()
                .HasForeignKey(attachment => attachment.CandidateResumeId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasIndex(attachment => attachment.CandidateResumeId);
            builder.HasIndex(attachment => attachment.StoredFileName).IsUnique();
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
