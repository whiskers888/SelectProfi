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
import {
  toViewLabel,
  workspaceViewOptions,
  type WorkspaceRole,
  type WorkspaceStat,
  type WorkspaceView,
} from '../model/data'

interface SidebarBaseProps {
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
}

interface ExecutorRewardState {
  stat: WorkspaceStat | null
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

type SidebarProps = SidebarBaseProps &
  (
    | { role: 'Executor'; executorReward: ExecutorRewardState }
    | { role: Exclude<WorkspaceRole, 'Executor'>; executorReward?: never }
  )

const navIconMap: Record<WorkspaceView, LucideIcon> = {
  dashboard: LayoutDashboard,
  orders: BriefcaseBusiness,
  candidates: UsersRound,
  meetings: CalendarDays,
  chats: MessageCircle,
  analytics: BarChart3,
  documents: FileStack,
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
  ...roleState
}: SidebarProps) {
  const executorReward = role === 'Executor' ? roleState.executorReward : null
  const showExpandedLabels = !collapsed || mobileOpen
  const visibleViewOptions =
    role === 'Customer'
      ? workspaceViewOptions.filter((view) => view.value !== 'orders')
      : workspaceViewOptions
          .filter((view) => view.value !== 'documents')
          .sort((left, right) => {
            if (role !== 'Executor') return 0
            const order: WorkspaceView[] = ['dashboard', 'orders', 'candidates', 'chats', 'meetings', 'analytics']
            return order.indexOf(left.value) - order.indexOf(right.value)
          })

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
              className={showExpandedLabels && role !== 'Executor' ? 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground' : 'sr-only'}
            >
              Роль аккаунта
            </span>
            <span
              className={`shrink-0 rounded bg-primary/10 py-0.5 text-[11px] font-semibold uppercase text-primary ${role === 'Executor' ? 'sr-only' : showExpandedLabels ? 'px-2' : 'px-1'}`}
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

        {executorReward ? (
          <div className="preview11-footer">
            <section aria-label="Вознаграждение" className="preview11-hint-card">
              <h2 className="preview11-hint-title">Вознаграждение</h2>
              {executorReward.stat ? (
                <div className="mt-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {executorReward.stat.label}
                    </span>
                    <strong className="text-sm font-bold text-foreground">
                      {executorReward.stat.value}
                    </strong>
                  </div>
                  {executorReward.stat.note ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {executorReward.stat.note}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {executorReward.isLoading && !executorReward.stat ? (
                <p className="mt-2 text-xs text-muted-foreground" role="status">
                  Загружаем баланс…
                </p>
              ) : null}

              {!executorReward.isLoading && !executorReward.stat && !executorReward.isError ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Данные о вознаграждении пока недоступны.
                </p>
              ) : null}

              {executorReward.isError ? (
                <div className="mt-2 text-xs" role="alert">
                  <p className="text-muted-foreground">
                    {executorReward.stat
                      ? 'Не удалось обновить данные о вознаграждении.'
                      : 'Не удалось загрузить данные о вознаграждении.'}
                  </p>
                  <button
                    className="mt-1 font-semibold text-primary underline-offset-4 hover:underline"
                    onClick={executorReward.onRetry}
                    type="button"
                  >
                    Повторить
                  </button>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}

      </aside>
    </>
  )
}
