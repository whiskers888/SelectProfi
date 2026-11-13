using KadryTu.Api.Data;
using KadryTu.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KadryTu.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("{role}")]
    public async Task<ActionResult<DashboardDto>> Get(string role)
    {
        var user = await _db.Users
            .Include(u => u.NavItems)
            .Include(u => u.Wallet).ThenInclude(w => w!.Rows)
            .Include(u => u.Orders)
                .ThenInclude(o => o.AlertButtons)
            .Include(u => u.Orders)
                .ThenInclude(o => o.Steps)
            .Include(u => u.Orders)
                .ThenInclude(o => o.Facts)
            .Include(u => u.Orders)
                .ThenInclude(o => o.Tabs)
            .Include(u => u.Orders)
                .ThenInclude(o => o.Candidates)
            .Include(u => u.Orders)
                .ThenInclude(o => o.VacancySections)
            .Include(u => u.Orders)
                .ThenInclude(o => o.Attachments)
            .Include(u => u.Orders)
                .ThenInclude(o => o.HistoryEvents)
            .AsSplitQuery()
            .FirstOrDefaultAsync(u => u.RoleKey == role);

        if (user is null)
        {
            return NotFound(new { message = $"Роль '{role}' не найдена" });
        }

        var wallet = user.Wallet is null
            ? null
            : new WalletDto(
                user.Wallet.Icon,
                user.Wallet.Title,
                user.Wallet.FooterText,
                user.Wallet.OrgLine,
                user.Wallet.Rows
                    .OrderBy(r => r.SortOrder)
                    .Select(r => new WalletRowDto(r.Label, r.Value, r.ValueTone))
                    .ToList());

        var orders = user.Orders
            .OrderBy(o => o.SortOrder)
            .Select(o => new OrderDto(
                o.Id,
                o.Number,
                o.Title,
                o.GroupLabel,
                o.DeadlineText,
                o.PartyText,
                o.PillText,
                o.PillKind,
                o.IsSelected,
                o.DetailMeta,
                o.BreadcrumbPrefix,
                o.AlertKind,
                o.AlertIcon,
                o.AlertBody,
                o.TableTitle,
                o.TableBadge,
                o.TableBadgeKind,
                o.FootNoteIcon,
                o.FootNote,
                o.DocsTitle,
                o.HistoryTitle,
                o.AlertButtons.OrderBy(b => b.SortOrder)
                    .Select(b => new AlertButtonDto(b.Id, b.Icon, b.Label, b.IsPrimary))
                    .ToList(),
                o.Steps.OrderBy(s => s.Index)
                    .Select(s => new ProcessStepDto(s.Index, s.Label, s.State))
                    .ToList(),
                o.Facts.OrderBy(f => f.SortOrder)
                    .Select(f => new FactDto(f.Label, f.Value))
                    .ToList(),
                o.Tabs.OrderBy(t => t.SortOrder)
                    .Select(t => new DetailTabDto(t.Label, t.Count, t.IsActive))
                    .ToList(),
                o.Candidates.OrderBy(c => c.SortOrder)
                    .Select(c => new OrderCandidateDto(
                        c.Id, c.DisplayName, c.IsAnonymous, c.ContactLine, c.ExperienceText,
                        c.Stage, c.SourceText, c.AccessText, c.AccessState,
                        c.SalaryText, c.MatchPercent, c.ActionLabel))
                    .ToList(),
                o.VacancySections.OrderBy(v => v.SortOrder)
                    .Select(v => new VacancySectionDto(v.SectionLabel, v.Content))
                    .ToList(),
                o.Attachments.OrderBy(a => a.SortOrder)
                    .Select(a => new AttachmentDto(a.Icon, a.Title, a.Meta))
                    .ToList(),
                o.HistoryEvents.OrderBy(h => h.SortOrder)
                    .Select(h => new HistoryEventDto(h.When, h.Actor, h.Action))
                    .ToList()))
            .ToList();

        return Ok(new DashboardDto(
            user.FullName,
            user.RoleKey,
            user.RoleBadge,
            user.RoleSubtitle,
            user.Initials,
            user.NotificationCount,
            user.ActionLabel,
            user.ActionIcon,
            user.ListTitle,
            user.SortOptions.Split('|'),
            user.FilterChips.Split('|'),
            user.NavItems.OrderBy(n => n.SortOrder)
                .Select(n => new NavItemDto(n.Id, n.Icon, n.Label, n.Count, n.IsActive))
                .ToList(),
            wallet,
            orders));
    }
}
