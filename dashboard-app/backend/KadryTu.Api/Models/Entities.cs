namespace KadryTu.Api.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public string RoleKey { get; set; } = null!;
    public string RoleBadge { get; set; } = null!;
    public string RoleSubtitle { get; set; } = null!;
    public string Initials { get; set; } = null!;
    public int NotificationCount { get; set; }
    public string ActionLabel { get; set; } = null!;
    public string ActionIcon { get; set; } = null!;
    public string ListTitle { get; set; } = null!;
    public string SortOptions { get; set; } = null!;
    public string FilterChips { get; set; } = null!;

    public ICollection<NavItem> NavItems { get; set; } = new List<NavItem>();
    public WalletCard? Wallet { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public class NavItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Icon { get; set; } = null!;
    public string Label { get; set; } = null!;
    public int? Count { get; set; }
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
}

public class WalletCard
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Icon { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string FooterText { get; set; } = null!;
    public string OrgLine { get; set; } = null!;

    public ICollection<WalletRow> Rows { get; set; } = new List<WalletRow>();
}

public class WalletRow
{
    public int Id { get; set; }
    public int WalletCardId { get; set; }
    public string Label { get; set; } = null!;
    public string Value { get; set; } = null!;
    public string ValueTone { get; set; } = null!;
    public int SortOrder { get; set; }
}

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Number { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string GroupLabel { get; set; } = null!;
    public string DeadlineText { get; set; } = null!;
    public string PartyText { get; set; } = null!;
    public string PillText { get; set; } = null!;
    public string PillKind { get; set; } = null!;
    public int SortOrder { get; set; }
    public bool IsSelected { get; set; }

    public string? DetailMeta { get; set; }
    public string? BreadcrumbPrefix { get; set; }
    public string? AlertKind { get; set; }
    public string? AlertIcon { get; set; }
    public string? AlertBody { get; set; }
    public string? TableTitle { get; set; }
    public string? TableBadge { get; set; }
    public string? TableBadgeKind { get; set; }
    public string? FootNoteIcon { get; set; }
    public string? FootNote { get; set; }
    public string? DocsTitle { get; set; }
    public string? HistoryTitle { get; set; }

    public ICollection<AlertButton> AlertButtons { get; set; } = new List<AlertButton>();
    public ICollection<ProcessStep> Steps { get; set; } = new List<ProcessStep>();
    public ICollection<Fact> Facts { get; set; } = new List<Fact>();
    public ICollection<DetailTab> Tabs { get; set; } = new List<DetailTab>();
    public ICollection<OrderCandidate> Candidates { get; set; } = new List<OrderCandidate>();
    public ICollection<VacancySection> VacancySections { get; set; } = new List<VacancySection>();
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    public ICollection<HistoryEvent> HistoryEvents { get; set; } = new List<HistoryEvent>();
}

public class AlertButton
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string Icon { get; set; } = null!;
    public string Label { get; set; } = null!;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public class ProcessStep
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int Index { get; set; }
    public string Label { get; set; } = null!;
    public string State { get; set; } = null!;
}

public class Fact
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string Label { get; set; } = null!;
    public string Value { get; set; } = null!;
    public int SortOrder { get; set; }
}

public class DetailTab
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string Label { get; set; } = null!;
    public int? Count { get; set; }
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
}

public class OrderCandidate
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string DisplayName { get; set; } = null!;
    public bool IsAnonymous { get; set; }
    public string? ContactLine { get; set; }
    public string ExperienceText { get; set; } = null!;
    public string? Stage { get; set; }
    public string? SourceText { get; set; }
    public string? AccessText { get; set; }
    public string? AccessState { get; set; }
    public string? SalaryText { get; set; }
    public string? MatchPercent { get; set; }
    public string ActionLabel { get; set; } = null!;
    public int SortOrder { get; set; }
}

public class VacancySection
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string SectionLabel { get; set; } = null!;
    public string Content { get; set; } = null!;
    public int SortOrder { get; set; }
}

public class Attachment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string Icon { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Meta { get; set; } = null!;
    public int SortOrder { get; set; }
}

public class HistoryEvent
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string When { get; set; } = null!;
    public string Actor { get; set; } = null!;
    public string Action { get; set; } = null!;
    public int SortOrder { get; set; }
}
