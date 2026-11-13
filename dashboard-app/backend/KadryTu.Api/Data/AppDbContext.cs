using KadryTu.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace KadryTu.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<NavItem> NavItems => Set<NavItem>();
    public DbSet<WalletCard> WalletCards => Set<WalletCard>();
    public DbSet<WalletRow> WalletRows => Set<WalletRow>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<AlertButton> AlertButtons => Set<AlertButton>();
    public DbSet<ProcessStep> ProcessSteps => Set<ProcessStep>();
    public DbSet<Fact> Facts => Set<Fact>();
    public DbSet<DetailTab> DetailTabs => Set<DetailTab>();
    public DbSet<OrderCandidate> OrderCandidates => Set<OrderCandidate>();
    public DbSet<VacancySection> VacancySections => Set<VacancySection>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<HistoryEvent> HistoryEvents => Set<HistoryEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasMany(u => u.NavItems).WithOne().HasForeignKey(n => n.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<User>().HasOne(u => u.Wallet).WithOne().HasForeignKey<WalletCard>(w => w.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<User>().HasMany(u => u.Orders).WithOne().HasForeignKey(o => o.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Order>().HasMany(o => o.AlertButtons).WithOne().HasForeignKey(b => b.OrderId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Order>().HasMany(o => o.Steps).WithOne().HasForeignKey(s => s.OrderId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Order>().HasMany(o => o.Facts).WithOne().HasForeignKey(f => f.OrderId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Order>().HasMany(o => o.Tabs).WithOne().HasForeignKey(t => t.OrderId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Order>().HasMany(o => o.Candidates).WithOne().HasForeignKey(c => c.OrderId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Order>().HasMany(o => o.VacancySections).WithOne().HasForeignKey(v => v.OrderId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Order>().HasMany(o => o.Attachments).WithOne().HasForeignKey(a => a.OrderId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Order>().HasMany(o => o.HistoryEvents).WithOne().HasForeignKey(h => h.OrderId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<WalletCard>().HasMany(w => w.Rows).WithOne().HasForeignKey(r => r.WalletCardId).OnDelete(DeleteBehavior.Cascade);

        SeedUsers(modelBuilder);
        SeedNavItems(modelBuilder);
        SeedWallets(modelBuilder);
        SeedOrders(modelBuilder);
        SeedAlertButtons(modelBuilder);
        SeedSteps(modelBuilder);
        SeedFacts(modelBuilder);
        SeedTabs(modelBuilder);
        SeedCandidates(modelBuilder);
        SeedVacancySections(modelBuilder);
        SeedAttachments(modelBuilder);
        SeedHistoryEvents(modelBuilder);
    }

    private static void SeedUsers(ModelBuilder b)
    {
        b.Entity<User>().HasData(
            new User
            {
                Id = 1,
                FullName = "Анна Ершова",
                RoleKey = "executor",
                RoleBadge = "ИСПОЛНИТЕЛЬ",
                RoleSubtitle = "Исполнитель · Рекрутер (СМЗ)",
                Initials = "АЕ",
                NotificationCount = 3,
                ActionLabel = "+ Добавить кандидата",
                ActionIcon = "person_add",
                ListTitle = "Мои проекты в работе",
                SortOptions = "По сроку сдачи|По сумме выплаты",
                FilterChips = "Все (3)|Требуют действия (2)|Ожидают заказчика (1)"
            },
            new User
            {
                Id = 2,
                FullName = "Ирина Котова",
                RoleKey = "customer",
                RoleBadge = "ЗАКАЗЧИК",
                RoleSubtitle = "Заказчик · ООО «Альфа Логистик»",
                Initials = "ИК",
                NotificationCount = 3,
                ActionLabel = "Создать заказ",
                ActionIcon = "add_circle",
                ListTitle = "Заказы на подбор",
                SortOptions = "По сроку решения|По дате создания|По бюджету",
                FilterChips = "Все (4)|Требуют решения (2)|В работе (1)|Архив"
            },
            new User
            {
                Id = 3,
                FullName = "Дмитрий Орлов",
                RoleKey = "applicant",
                RoleBadge = "СОИСКАТЕЛЬ",
                RoleSubtitle = "Соискатель · Frontend-разработчик",
                Initials = "ДО",
                NotificationCount = 3,
                ActionLabel = "Найти вакансию",
                ActionIcon = "search",
                ListTitle = "Мои отклики",
                SortOptions = "По статусу|По дате отклика",
                FilterChips = "Все (3)|Приглашения (1)|На рассмотрении (1)|Архив"
            });
    }

    private static void SeedNavItems(ModelBuilder b)
    {
        b.Entity<NavItem>().HasData(
            new NavItem { Id = 11, UserId = 1, Icon = "folder_special", Label = "Мои проекты", Count = 3, IsActive = true, SortOrder = 1 },
            new NavItem { Id = 12, UserId = 1, Icon = "travel_explore", Label = "Биржа заказов", Count = 2, IsActive = false, SortOrder = 2 },
            new NavItem { Id = 13, UserId = 1, Icon = "contacts", Label = "Кандидаты", Count = 12, IsActive = false, SortOrder = 3 },
            new NavItem { Id = 14, UserId = 1, Icon = "calendar_today", Label = "Встречи", Count = 2, IsActive = false, SortOrder = 4 },
            new NavItem { Id = 15, UserId = 1, Icon = "chat_bubble_outline", Label = "Сообщения", Count = 1, IsActive = false, SortOrder = 5 },
            new NavItem { Id = 16, UserId = 1, Icon = "insights", Label = "Аналитика", Count = null, IsActive = false, SortOrder = 6 },
            new NavItem { Id = 21, UserId = 2, Icon = "work_outline", Label = "Мои заказы", Count = 4, IsActive = true, SortOrder = 1 },
            new NavItem { Id = 22, UserId = 2, Icon = "group", Label = "Кандидаты", Count = 2, IsActive = false, SortOrder = 2 },
            new NavItem { Id = 23, UserId = 2, Icon = "calendar_today", Label = "Встречи", Count = 1, IsActive = false, SortOrder = 3 },
            new NavItem { Id = 24, UserId = 2, Icon = "chat_bubble_outline", Label = "Сообщения", Count = 3, IsActive = false, SortOrder = 4 },
            new NavItem { Id = 25, UserId = 2, Icon = "description", Label = "Документы", Count = null, IsActive = false, SortOrder = 5 },
            new NavItem { Id = 26, UserId = 2, Icon = "insert_chart_outlined", Label = "Аналитика", Count = null, IsActive = false, SortOrder = 6 },
            new NavItem { Id = 31, UserId = 3, Icon = "send", Label = "Мои отклики", Count = 3, IsActive = true, SortOrder = 1 },
            new NavItem { Id = 32, UserId = 3, Icon = "work", Label = "База вакансий", Count = 128, IsActive = false, SortOrder = 2 },
            new NavItem { Id = 33, UserId = 3, Icon = "badge", Label = "Мои резюме", Count = 1, IsActive = false, SortOrder = 3 },
            new NavItem { Id = 34, UserId = 3, Icon = "calendar_today", Label = "Встречи", Count = 1, IsActive = false, SortOrder = 4 },
            new NavItem { Id = 35, UserId = 3, Icon = "chat_bubble_outline", Label = "Сообщения", Count = 1, IsActive = false, SortOrder = 5 });
    }

    private static void SeedWallets(ModelBuilder b)
    {
        b.Entity<WalletCard>().HasData(
            new WalletCard { Id = 1, UserId = 1, Icon = "payments", Title = "Вознаграждение", FooterText = "Рейтинг 4,8 ★ · 23 закрытых", OrgLine = "ИНН 772501234567 (СМЗ)" },
            new WalletCard { Id = 2, UserId = 2, Icon = "account_balance_wallet", Title = "Эскроу-кошелек", FooterText = "ООО «Альфа Логистик»", OrgLine = "ИНН 7704123456" },
            new WalletCard { Id = 3, UserId = 3, Icon = "query_stats", Title = "Активность резюме", FooterText = "Резюме заполнено на 80% · В активном поиске", OrgLine = "" });

        b.Entity<WalletRow>().HasData(
            new WalletRow { Id = 101, WalletCardId = 1, Label = "К получению:", Value = "255 000 ₽", ValueTone = "primary", SortOrder = 1 },
            new WalletRow { Id = 102, WalletCardId = 1, Label = "Выплачено в ноябре:", Value = "85 000 ₽", ValueTone = "default", SortOrder = 2 },
            new WalletRow { Id = 201, WalletCardId = 2, Label = "Зарезервировано:", Value = "360 000 ₽", ValueTone = "default", SortOrder = 1 },
            new WalletRow { Id = 202, WalletCardId = 2, Label = "Свободный остаток:", Value = "140 000 ₽", ValueTone = "default", SortOrder = 2 },
            new WalletRow { Id = 301, WalletCardId = 3, Label = "Просмотров резюме:", Value = "14 за неделю", ValueTone = "primary", SortOrder = 1 },
            new WalletRow { Id = 302, WalletCardId = 3, Label = "Ответов компаний:", Value = "2 из 5", ValueTone = "default", SortOrder = 2 });
    }

    private static void SeedOrders(ModelBuilder b)
    {
        b.Entity<Order>().HasData(
            new Order
            {
                Id = 101, UserId = 1, Number = "З-1039", Title = "Менеджер по продажам B2B",
                GroupLabel = "Требуют вашего действия", DeadlineText = "до 15.11 (осталось 6 дней)",
                PartyText = "ООО «Вектор»", PillText = "Shortlist 2 из 3", PillKind = "warn", SortOrder = 1, IsSelected = true,
                DetailMeta = "Заказ № З-1039 · Вы назначены исполнителем 28.10.2026 · Заказчик: ООО «Вектор»",
                BreadcrumbPrefix = "Мои проекты",
                AlertKind = "warn", AlertIcon = "assignment_late",
                AlertBody = "Заказчик ожидает 3 финалистов в Shortlist. Вы уже добавили 2 подходящих кандидатов. Переведите ещё одного специалиста из вашего Pool или привяжите нового соискателя из вашей базы.",
                TableTitle = "Кандидаты проекта: Pool и Shortlist", TableBadge = "Ваши прямые контакты открыты", TableBadgeKind = "rights",
                FootNoteIcon = "lock_open", FootNote = "Правило защиты рекрутера: контакты закрепляются за первым привязавшим рекрутером на 180 дней с автоматической защитой комиссии",
                DocsTitle = "Документы по проекту", HistoryTitle = "История проекта"
            },
            new Order
            {
                Id = 102, UserId = 1, Number = "З-1045", Title = "Бухгалтер на первичку",
                GroupLabel = "Требуют вашего действия", DeadlineText = "до 11.11",
                PartyText = "ИП Смирнова Е. В.", PillText = "Черновик вакансии", PillKind = "warn", SortOrder = 2, IsSelected = false
            },
            new Order
            {
                Id = 103, UserId = 1, Number = "З-1042", Title = "Senior React-разработчик",
                GroupLabel = "Ожидают заказчика", DeadlineText = "до 12.11",
                PartyText = "ООО «Альфа Логистик»", PillText = "Выбор финалиста", PillKind = "info", SortOrder = 3, IsSelected = false
            },
            new Order
            {
                Id = 201, UserId = 2, Number = "З-1042", Title = "Senior React-разработчик",
                GroupLabel = "Требуют вашего решения", DeadlineText = "до 12.11 (осталось 3 дня)",
                PartyText = "Исполнитель: А. Ершова", PillText = "Выбор финалиста", PillKind = "warn", SortOrder = 1, IsSelected = true,
                DetailMeta = "Заказ № З-1042 от 02.11.2026 · Заключен через платформу КадрыТут",
                BreadcrumbPrefix = "Мои заказы",
                AlertKind = "warn", AlertIcon = "info",
                AlertBody = "Исполнитель подготовил Shortlist из 3 кандидатов.\nВыберите одного кандидата — после подтверждения вам мгновенно откроются прямые контакты (телефон, Telegram, email) и сформируется закрывающий акт.",
                TableTitle = "Кандидаты в шортлисте", TableBadge = "Анонимные профили до выбора", TableBadgeKind = "alias",
                FootNoteIcon = "verified_user", FootNote = "ФИО, контакты и портфолио станут мгновенно доступны заказчику сразу после нажатия кнопки «Выбрать финалиста»",
                DocsTitle = "Документы по заказу", HistoryTitle = "История изменений"
            },
            new Order
            {
                Id = 202, UserId = 2, Number = "З-1047", Title = "Product Designer",
                GroupLabel = "Требуют вашего решения", DeadlineText = "до 14.11",
                PartyText = "4 отклика рекрутеров", PillText = "Выбор исполнителя", PillKind = "warn", SortOrder = 2, IsSelected = false
            },
            new Order
            {
                Id = 203, UserId = 2, Number = "З-1045", Title = "Бухгалтер на первичку",
                GroupLabel = "В работе", DeadlineText = "до 20.11",
                PartyText = "Исполнитель: О. Мирный", PillText = "На согласовании", PillKind = "idle", SortOrder = 3, IsSelected = false
            },
            new Order
            {
                Id = 204, UserId = 2, Number = "З-1039", Title = "Менеджер по продажам B2B",
                GroupLabel = "В работе", DeadlineText = "до 30.11",
                PartyText = "Исполнитель: А. Ершова", PillText = "Pool · 5 кандидатов", PillKind = "info", SortOrder = 4, IsSelected = false
            },
            new Order
            {
                Id = 301, UserId = 3, Number = "В-2210", Title = "Senior React-разработчик",
                GroupLabel = "Требуют ответа", DeadlineText = "ответ до 13.11",
                PartyText = "ООО «Альфа Логистик»", PillText = "Приглашение на интервью", PillKind = "ok", SortOrder = 1, IsSelected = true,
                DetailMeta = "Вакансия № В-2210 · Отклик от 03.11.2026 · Компания: ООО «Альфа Логистик»",
                BreadcrumbPrefix = "Мои отклики",
                AlertKind = "ok", AlertIcon = "event_available",
                AlertBody = "Компания приглашает вас на первичное интервью.\nПодтвердите предложенное удобное время — прямая ссылка на видеоконференцию появится в разделе «Встречи» и продублируется в сообщениях.",
                TableTitle = "Подробное описание позиции", TableBadge = "ID вакансии: В-2210", TableBadgeKind = "plain",
                FootNoteIcon = null, FootNote = null,
                DocsTitle = "Прикрепленные файлы", HistoryTitle = "История отклика"
            },
            new Order
            {
                Id = 302, UserId = 3, Number = "В-2198", Title = "Frontend-разработчик",
                GroupLabel = "На рассмотрении", DeadlineText = "с 04.11",
                PartyText = "ООО «Вектор»", PillText = "Рассматривают", PillKind = "idle", SortOrder = 2, IsSelected = false
            },
            new Order
            {
                Id = 303, UserId = 3, Number = "В-2231", Title = "React Native-разработчик",
                GroupLabel = "На рассмотрении", DeadlineText = "с 08.11",
                PartyText = "АО «Север Digital»", PillText = "Отправлен", PillKind = "idle", SortOrder = 3, IsSelected = false
            });
    }

    private static void SeedAlertButtons(ModelBuilder b)
    {
        b.Entity<AlertButton>().HasData(
            new AlertButton { Id = 1, OrderId = 101, Icon = "playlist_add_check", Label = "Добавить в Shortlist", IsPrimary = true, SortOrder = 1 },
            new AlertButton { Id = 2, OrderId = 101, Icon = "person_add", Label = "Загрузить резюме в Pool", IsPrimary = false, SortOrder = 2 },
            new AlertButton { Id = 3, OrderId = 101, Icon = "chat", Label = "Написать заказчику (В. Ларин)", IsPrimary = false, SortOrder = 3 },
            new AlertButton { Id = 4, OrderId = 201, Icon = "how_to_reg", Label = "Выбрать финалиста", IsPrimary = true, SortOrder = 1 },
            new AlertButton { Id = 5, OrderId = 201, Icon = "cached", Label = "Запросить ещё кандидатов", IsPrimary = false, SortOrder = 2 },
            new AlertButton { Id = 6, OrderId = 201, Icon = "chat", Label = "Написать исполнителю", IsPrimary = false, SortOrder = 3 },
            new AlertButton { Id = 7, OrderId = 301, Icon = "done", Label = "Подтвердить чт, 12 ноября, 12:00", IsPrimary = true, SortOrder = 1 },
            new AlertButton { Id = 8, OrderId = 301, Icon = "edit_calendar", Label = "Предложить другое время", IsPrimary = false, SortOrder = 2 },
            new AlertButton { Id = 9, OrderId = 301, Icon = "chat", Label = "Написать компании", IsPrimary = false, SortOrder = 3 });
    }

    private static void SeedSteps(ModelBuilder b)
    {
        b.Entity<ProcessStep>().HasData(
            new ProcessStep { Id = 1, OrderId = 101, Index = 1, Label = "Заказ", State = "done" },
            new ProcessStep { Id = 2, OrderId = 101, Index = 2, Label = "Назначение", State = "done" },
            new ProcessStep { Id = 3, OrderId = 101, Index = 3, Label = "Вакансия", State = "done" },
            new ProcessStep { Id = 4, OrderId = 101, Index = 4, Label = "Pool кандидатов", State = "done" },
            new ProcessStep { Id = 5, OrderId = 101, Index = 5, Label = "Shortlist (2/3)", State = "now" },
            new ProcessStep { Id = 6, OrderId = 101, Index = 6, Label = "Финалист", State = "upcoming" },
            new ProcessStep { Id = 7, OrderId = 101, Index = 7, Label = "Выплата гонорара", State = "upcoming" },
            new ProcessStep { Id = 8, OrderId = 201, Index = 1, Label = "Заказ", State = "done" },
            new ProcessStep { Id = 9, OrderId = 201, Index = 2, Label = "Исполнитель", State = "done" },
            new ProcessStep { Id = 10, OrderId = 201, Index = 3, Label = "Вакансия", State = "done" },
            new ProcessStep { Id = 11, OrderId = 201, Index = 4, Label = "Скрининг", State = "done" },
            new ProcessStep { Id = 12, OrderId = 201, Index = 5, Label = "Выбор финалиста", State = "now" },
            new ProcessStep { Id = 13, OrderId = 201, Index = 6, Label = "Оффер", State = "upcoming" },
            new ProcessStep { Id = 14, OrderId = 201, Index = 7, Label = "Закрытие и акт", State = "upcoming" },
            new ProcessStep { Id = 15, OrderId = 301, Index = 1, Label = "Отклик", State = "done" },
            new ProcessStep { Id = 16, OrderId = 301, Index = 2, Label = "Рассмотрение", State = "done" },
            new ProcessStep { Id = 17, OrderId = 301, Index = 3, Label = "Приглашение на интервью", State = "now" },
            new ProcessStep { Id = 18, OrderId = 301, Index = 4, Label = "Техническое интервью", State = "upcoming" },
            new ProcessStep { Id = 19, OrderId = 301, Index = 5, Label = "Решение и оффер", State = "upcoming" });
    }

    private static void SeedFacts(ModelBuilder b)
    {
        b.Entity<Fact>().HasData(
            new Fact { Id = 1, OrderId = 101, Label = "Заказчик проекта", Value = "ООО «Вектор» · В. Ларин (HRD)", SortOrder = 1 },
            new Fact { Id = 2, OrderId = 101, Label = "Ваш гонорар к получению", Value = "76 500 ₽ (90 000 ₽ − комиссия 15%)", SortOrder = 2 },
            new Fact { Id = 3, OrderId = 101, Label = "Зарплата сотрудника", Value = "от 120 000 ₽ + % от продаж", SortOrder = 3 },
            new Fact { Id = 4, OrderId = 101, Label = "График и локация", Value = "5/2, офис м. Белорусская", SortOrder = 4 },
            new Fact { Id = 5, OrderId = 101, Label = "Защита базы контактов", Value = "Эксклюзивное закрепление 180 дней", SortOrder = 5 },
            new Fact { Id = 6, OrderId = 101, Label = "Крайний срок закрытия", Value = "15.11.2026 · осталось 6 дней", SortOrder = 6 },
            new Fact { Id = 7, OrderId = 201, Label = "Исполнитель заказа", Value = "Анна Ершова · рейтинг 4,8 ★ (23 закрытых)", SortOrder = 1 },
            new Fact { Id = 8, OrderId = 201, Label = "Стоимость услуги подбора", Value = "120 000 ₽ · зарезервировано на эскроу", SortOrder = 2 },
            new Fact { Id = 9, OrderId = 201, Label = "Зарплатная вилка кандидата", Value = "250 000 – 300 000 ₽ net", SortOrder = 3 },
            new Fact { Id = 10, OrderId = 201, Label = "Формат и график", Value = "5/2, гибрид 3/2 (офис м. Курская)", SortOrder = 4 },
            new Fact { Id = 11, OrderId = 201, Label = "Гарантийный период", Value = "90 дней с даты выхода кандидата", SortOrder = 5 },
            new Fact { Id = 12, OrderId = 201, Label = "Крайний срок этапа", Value = "12.11.2026 · осталось 3 дня", SortOrder = 6 },
            new Fact { Id = 13, OrderId = 301, Label = "Работодатель", Value = "ООО «Альфа Логистик» · логистика", SortOrder = 1 },
            new Fact { Id = 14, OrderId = 301, Label = "Уровень вознаграждения", Value = "250 000 – 300 000 ₽ net", SortOrder = 2 },
            new Fact { Id = 15, OrderId = 301, Label = "График и формат работы", Value = "5/2, гибрид 3/2 (офис м. Курская)", SortOrder = 3 },
            new Fact { Id = 16, OrderId = 301, Label = "Формат собеседования", Value = "Видеозвонок (Яндекс Телемост), 45 мин", SortOrder = 4 },
            new Fact { Id = 17, OrderId = 301, Label = "Оформление", Value = "ТК РФ, белая зарплата, ДМС со стоматологией", SortOrder = 5 },
            new Fact { Id = 18, OrderId = 301, Label = "Контактное лицо", Value = "Ирина Котова (HR-директор)", SortOrder = 6 });
    }

    private static void SeedTabs(ModelBuilder b)
    {
        b.Entity<DetailTab>().HasData(
            new DetailTab { Id = 1, OrderId = 101, Label = "Pool и Shortlist кандидатов", Count = 5, IsActive = true, SortOrder = 1 },
            new DetailTab { Id = 2, OrderId = 101, Label = "Требования вакансии", Count = null, IsActive = false, SortOrder = 2 },
            new DetailTab { Id = 3, OrderId = 101, Label = "Договор и акты", Count = 1, IsActive = false, SortOrder = 3 },
            new DetailTab { Id = 4, OrderId = 101, Label = "История взаимодействий", Count = null, IsActive = false, SortOrder = 4 },
            new DetailTab { Id = 5, OrderId = 201, Label = "Shortlist кандидатов", Count = 3, IsActive = true, SortOrder = 1 },
            new DetailTab { Id = 6, OrderId = 201, Label = "Описание вакансии", Count = null, IsActive = false, SortOrder = 2 },
            new DetailTab { Id = 7, OrderId = 201, Label = "Документы и счета", Count = 2, IsActive = false, SortOrder = 3 },
            new DetailTab { Id = 8, OrderId = 201, Label = "История согласований", Count = null, IsActive = false, SortOrder = 4 },
            new DetailTab { Id = 9, OrderId = 301, Label = "Условия и требования вакансии", Count = null, IsActive = true, SortOrder = 1 },
            new DetailTab { Id = 10, OrderId = 301, Label = "Интервью и слот", Count = null, IsActive = false, SortOrder = 2 },
            new DetailTab { Id = 11, OrderId = 301, Label = "Отправленное резюме", Count = null, IsActive = false, SortOrder = 3 },
            new DetailTab { Id = 12, OrderId = 301, Label = "История статусов", Count = null, IsActive = false, SortOrder = 4 });
    }

    private static void SeedCandidates(ModelBuilder b)
    {
        b.Entity<OrderCandidate>().HasData(
            new OrderCandidate
            {
                Id = 1, OrderId = 101, DisplayName = "Мария Соколова", IsAnonymous = false,
                ContactLine = "+7 916 345-21-90 · TG: @sokolova_b2b",
                ExperienceText = "4 года · B2B, CRM Bitrix24, сложные сделки",
                Stage = "shortlist", SourceText = "Ваша база", AccessText = "08.05.2027", AccessState = "verified",
                ActionLabel = "Профиль", SortOrder = 1
            },
            new OrderCandidate
            {
                Id = 2, OrderId = 101, DisplayName = "Ольга Белова", IsAnonymous = false,
                ContactLine = "+7 926 880-14-33 · o.belova@mail.ru",
                ExperienceText = "7 лет · B2B продажи, тендеры 44-ФЗ/223-ФЗ",
                Stage = "shortlist", SourceText = "Отклик", AccessText = "01.05.2027", AccessState = "verified",
                ActionLabel = "Профиль", SortOrder = 2
            },
            new OrderCandidate
            {
                Id = 3, OrderId = 101, DisplayName = "Игорь Лебедев", IsAnonymous = false,
                ContactLine = "+7 903 112-99-40 · TG: @lebedev_sales",
                ExperienceText = "3 года · холодные звонки, дистрибуция",
                Stage = "pool", SourceText = "Ваша база", AccessText = "12.05.2027", AccessState = "verified",
                ActionLabel = "В Shortlist", SortOrder = 3
            },
            new OrderCandidate
            {
                Id = 4, OrderId = 101, DisplayName = "Светлана Ким", IsAnonymous = false,
                ContactLine = "+7 985 771-00-12",
                ExperienceText = "5 лет · FMCG дистрибуция, опт",
                Stage = "pool", SourceText = "Отклик", AccessText = "—", AccessState = null,
                ActionLabel = "В Shortlist", SortOrder = 4
            },
            new OrderCandidate
            {
                Id = 5, OrderId = 101, DisplayName = "Павел Орехов", IsAnonymous = false,
                ContactLine = "Скрыт платформой",
                ExperienceText = "2 года · B2B продажи сервисов",
                Stage = "pool", SourceText = "База платформы", AccessText = "нет доступа", AccessState = "locked",
                ActionLabel = "Запросить", SortOrder = 5
            },
            new OrderCandidate
            {
                Id = 6, OrderId = 201, DisplayName = "Внимательный Frontend", IsAnonymous = true,
                ExperienceText = "6 лет · React, TypeScript, Redux, Next.js",
                SalaryText = "280 000 ₽", MatchPercent = "92%", AccessText = "06.11",
                ActionLabel = "Резюме", SortOrder = 1
            },
            new OrderCandidate
            {
                Id = 7, OrderId = 201, DisplayName = "Системный Frontend", IsAnonymous = true,
                ExperienceText = "4 года · React, Webpack, Tailwind, REST",
                SalaryText = "260 000 ₽", MatchPercent = "85%", AccessText = "07.11",
                ActionLabel = "Резюме", SortOrder = 2
            },
            new OrderCandidate
            {
                Id = 8, OrderId = 201, DisplayName = "Аккуратный Frontend", IsAnonymous = true,
                ExperienceText = "5 лет · Vue 3 → React, MobX, CI/CD",
                SalaryText = "250 000 ₽", MatchPercent = "81%", AccessText = "08.11",
                ActionLabel = "Резюме", SortOrder = 3
            });
    }

    private static void SeedVacancySections(ModelBuilder b)
    {
        b.Entity<VacancySection>().HasData(
            new VacancySection
            {
                Id = 1, OrderId = 301, SectionLabel = "Задачи", SortOrder = 1,
                Content = "Разработка высоконагруженного личного кабинета клиентов и партнеров логистической платформы, участие в проектировании архитектуры фронтенда на Next.js, развитие собственной дизайн-системы компонентов."
            },
            new VacancySection
            {
                Id = 2, OrderId = 301, SectionLabel = "Требования", SortOrder = 2,
                Content = "Опыт коммерческой разработки на React и TypeScript от 4 лет, глубокое понимание паттернов управления состоянием (Redux Toolkit / Zustand), опыт написания тестов (Jest, Playwright) и работы с дизайн-системами."
            },
            new VacancySection
            {
                Id = 3, OrderId = 301, SectionLabel = "Условия", SortOrder = 3,
                Content = "Официальное трудоустройство с первого дня, расширенный пакет ДМС, компенсация современной техники, гибкое начало рабочего дня (с 9:00 до 11:00), бюджет на обучение и профильные конференции."
            },
            new VacancySection
            {
                Id = 4, OrderId = 301, SectionLabel = "Этапы отбора", SortOrder = 4,
                Content = "Первичное знакомство с HR (45 мин) → Техническая сессия с лидом команды (1.5 часа) → Финальная встреча с CTO и оффер."
            });
    }

    private static void SeedAttachments(ModelBuilder b)
    {
        b.Entity<Attachment>().HasData(
            new Attachment { Id = 1, OrderId = 101, Icon = "assignment", Title = "Договор-оферта № 1039", Meta = "Принят вами 28.10.2026 · В силе", SortOrder = 1 },
            new Attachment { Id = 2, OrderId = 101, Icon = "credit_card", Title = "Акт и автовыплата СМЗ", Meta = "Сформируется чек в «Мой Налог» при выборе", SortOrder = 2 },
            new Attachment { Id = 3, OrderId = 201, Icon = "description", Title = "Договор-оферта № 1042", Meta = "Подписан ПЭП 02.11.2026 · Статус: OK", SortOrder = 1 },
            new Attachment { Id = 4, OrderId = 201, Icon = "receipt_long", Title = "Акт оказания услуг подбора", Meta = "Сформируется после утверждения финалиста", SortOrder = 2 },
            new Attachment { Id = 5, OrderId = 301, Icon = "badge", Title = "Резюме «Frontend-разработчик»", Meta = "Версия от 01.11.2026 · Отправлена работодателю", SortOrder = 1 });
    }

    private static void SeedHistoryEvents(ModelBuilder b)
    {
        b.Entity<HistoryEvent>().HasData(
            new HistoryEvent { Id = 1, OrderId = 101, When = "09.11, 10:15", Actor = "В. Ларин (Заказчик)", Action = "открыл резюме кандидата «Мария Соколова»", SortOrder = 1 },
            new HistoryEvent { Id = 2, OrderId = 101, When = "08.11, 18:02", Actor = "Вы", Action = "перевели кандидата «Ольга Белова» в Shortlist", SortOrder = 2 },
            new HistoryEvent { Id = 3, OrderId = 101, When = "30.10, 12:44", Actor = "В. Ларин", Action = "согласовал финальные требования вакансии", SortOrder = 3 },
            new HistoryEvent { Id = 4, OrderId = 101, When = "28.10, 09:10", Actor = "Система", Action = "назначила вас рекрутером проекта", SortOrder = 4 },
            new HistoryEvent { Id = 5, OrderId = 201, When = "09.11, 09:40", Actor = "А. Ершова", Action = "добавила 2 кандидатов в Shortlist", SortOrder = 1 },
            new HistoryEvent { Id = 6, OrderId = 201, When = "05.11, 16:12", Actor = "Вы", Action = "согласовали описание требований", SortOrder = 2 },
            new HistoryEvent { Id = 7, OrderId = 201, When = "03.11, 11:05", Actor = "Система", Action = "назначила рекрутера А. Ершову", SortOrder = 3 },
            new HistoryEvent { Id = 8, OrderId = 201, When = "02.11, 10:30", Actor = "Вы", Action = "создали заказ, 120 000 ₽ зарезервировано", SortOrder = 4 },
            new HistoryEvent { Id = 9, OrderId = 301, When = "09.11, 11:20", Actor = "ООО «Альфа Логистик»", Action = "пригласила вас на интервью", SortOrder = 1 },
            new HistoryEvent { Id = 10, OrderId = 301, When = "05.11, 14:02", Actor = "HR-директор", Action = "просмотрела ваше резюме", SortOrder = 2 },
            new HistoryEvent { Id = 11, OrderId = 301, When = "03.11, 20:15", Actor = "Вы", Action = "откликнулись на вакансию платформы", SortOrder = 3 });
    }
}
