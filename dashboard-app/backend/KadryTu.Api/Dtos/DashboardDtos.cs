namespace KadryTu.Api.Dtos;

public record NavItemDto(int Id, string Icon, string Label, int? Count, bool IsActive);

public record WalletRowDto(string Label, string Value, string ValueTone);

public record WalletDto(string Icon, string Title, string FooterText, string OrgLine, List<WalletRowDto> Rows);

public record AlertButtonDto(int Id, string Icon, string Label, bool IsPrimary);

public record ProcessStepDto(int Index, string Label, string State);

public record FactDto(string Label, string Value);

public record DetailTabDto(string Label, int? Count, bool IsActive);

public record OrderCandidateDto(
    int Id,
    string DisplayName,
    bool IsAnonymous,
    string? ContactLine,
    string ExperienceText,
    string? Stage,
    string? SourceText,
    string? AccessText,
    string? AccessState,
    string? SalaryText,
    string? MatchPercent,
    string ActionLabel);

public record VacancySectionDto(string SectionLabel, string Content);

public record AttachmentDto(string Icon, string Title, string Meta);

public record HistoryEventDto(string When, string Actor, string Action);

public record OrderDto(
    int Id,
    string Number,
    string Title,
    string GroupLabel,
    string DeadlineText,
    string PartyText,
    string PillText,
    string PillKind,
    bool IsSelected,
    string? DetailMeta,
    string? BreadcrumbPrefix,
    string? AlertKind,
    string? AlertIcon,
    string? AlertBody,
    string? TableTitle,
    string? TableBadge,
    string? TableBadgeKind,
    string? FootNoteIcon,
    string? FootNote,
    string? DocsTitle,
    string? HistoryTitle,
    List<AlertButtonDto> AlertButtons,
    List<ProcessStepDto> Steps,
    List<FactDto> Facts,
    List<DetailTabDto> Tabs,
    List<OrderCandidateDto> Candidates,
    List<VacancySectionDto> VacancySections,
    List<AttachmentDto> Attachments,
    List<HistoryEventDto> HistoryEvents);

public record DashboardDto(
    string FullName,
    string RoleKey,
    string RoleBadge,
    string RoleSubtitle,
    string Initials,
    int NotificationCount,
    string ActionLabel,
    string ActionIcon,
    string ListTitle,
    string[] SortOptions,
    string[] FilterChips,
    List<NavItemDto> NavItems,
    WalletDto? Wallet,
    List<OrderDto> Orders);
