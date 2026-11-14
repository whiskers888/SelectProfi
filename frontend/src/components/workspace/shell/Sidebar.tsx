import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  FileStack,
  FileText,
  LayoutDashboard,
  MessageCircle,
  type LucideIcon,
  UsersRound,
} from 'lucide-react'
import { workspaceViewOptions, type WorkspaceRole, type WorkspaceView } from '../model/data'

interface SidebarProps {
  activeView: WorkspaceView
  collapsed: boolean
  counters: Partial<Record<WorkspaceView, number>>
  createLabel: string | null
  mobileOpen: boolean
  onCloseMobile: () => void
  onCreateAction: () => void
  onToggleCollapse: () => void
  onViewChange: (view: WorkspaceView) => void
  roleLabel: string
  role: WorkspaceRole
}

const navIconMap: Record<WorkspaceView, LucideIcon> = {
  dashboard: LayoutDashboard,
  orders: BriefcaseBusiness,
  candidates: UsersRound,
  meetings: CalendarDays,
  chats: MessageCircle,
  analytics: BarChart3,
  documents: FileStack,
}

function toViewLabel(view: WorkspaceView, role: WorkspaceRole): string {
  if (role === 'Executor' && view === 'dashboard') {
    return 'Мои проекты'
  }

  if (role === 'Executor' && view === 'orders') {
    return 'Биржа проектов'
  }

  if (role === 'Applicant' && view === 'dashboard') {
    return 'Мои отклики'
  }

  if (role === 'Applicant' && view === 'orders') {
    return 'Вакансии'
  }

  if (role === 'Applicant' && view === 'candidates') {
    return 'Мои резюме'
  }

  return workspaceViewOptions.find((option) => option.value === view)?.label ?? view
}

function toViewIcon(view: WorkspaceView, role: WorkspaceRole): LucideIcon {
  if (role === 'Applicant' && view === 'orders') {
    return BriefcaseBusiness
  }

  if (role === 'Applicant' && view === 'candidates') {
    return FileText
  }

  return navIconMap[view]
}

export function Sidebar({
  activeView,
  collapsed,
  counters,
  createLabel,
  mobileOpen,
  onCloseMobile,
  onCreateAction,
  onToggleCollapse,
  onViewChange,
  roleLabel,
  role,
}: SidebarProps) {
  const showExpandedLabels = !collapsed || mobileOpen
  const visibleViewOptions =
    role === 'Customer'
      ? workspaceViewOptions.filter((view) => view.value !== 'orders')
      : workspaceViewOptions.filter((view) => view.value !== 'documents')

  // Мобильный drawer: sidebar остаётся в DOM, на узких экранах едет из-за левого края по классу -mobile-open.
  return (
    <>
      <button
        aria-hidden={!mobileOpen}
        className={`preview11-sidebar-backdrop${mobileOpen ? ' preview11-sidebar-backdrop-visible' : ''}`}
        onClick={onCloseMobile}
        tabIndex={mobileOpen ? 0 : -1}
        type="button"
        aria-label="Закрыть навигацию"
      />
      <aside
        className={`preview11-sidebar${collapsed ? ' preview11-sidebar-collapsed' : ''}${mobileOpen ? ' preview11-sidebar-mobile-open' : ''}`}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={showExpandedLabels ? 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground' : 'sr-only'}
            >
              Роль аккаунта
            </span>
            <span
              className={`shrink-0 rounded bg-primary/10 py-0.5 text-[11px] font-semibold uppercase text-primary ${showExpandedLabels ? 'px-2' : 'px-1'}`}
              title={roleLabel}
            >
              {showExpandedLabels ? roleLabel : roleLabel.slice(0, 1)}
            </span>
          </div>
          <button
            aria-label={collapsed ? 'Развернуть навигацию' : 'Свернуть навигацию'}
            className="preview11-side-btn"
            onClick={onToggleCollapse}
            type="button"
          >
            {collapsed ? '⇥' : '⇤'}
          </button>
        </div>

        {createLabel ? (
          <button
            aria-label={createLabel}
            className="preview11-btn preview11-btn-primary mb-1 w-full gap-2"
            onClick={onCreateAction}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              +
            </span>
            {showExpandedLabels ? createLabel : null}
          </button>
        ) : null}

        <nav aria-label="Основные разделы" className="preview11-nav">
          {visibleViewOptions.map((view) => {
            const isActive = activeView === view.value
            const Icon = toViewIcon(view.value, role)
            const label = toViewLabel(view.value, role)
            const counter = counters[view.value] ?? 0

            return (
              <button
                key={view.value}
                aria-current={isActive ? 'page' : undefined}
                aria-label={counter > 0 ? `${label}, ${counter}` : label}
                className={`preview11-nav-btn${isActive ? ' preview11-nav-btn-active' : ''}`}
                onClick={() => onViewChange(view.value)}
                type="button"
              >
                <span className="preview11-nav-left">
                  <span className="preview11-nav-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <span className="preview11-nav-label">{label}</span>
                </span>
                {counter > 0 ? (
                  <span aria-hidden="true" className="preview11-badge">
                    {counter}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

      </aside>
    </>
  )
}
