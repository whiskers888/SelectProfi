import { workspaceViewOptions, type WorkspaceRole, type WorkspaceView } from '../model/data'

type SidebarProps = {
  activeView: WorkspaceView
  collapsed: boolean
  counters: Partial<Record<WorkspaceView, number>>
  onToggleCollapse: () => void
  onViewChange: (view: WorkspaceView) => void
  role: WorkspaceRole
}

const navIconMap: Record<WorkspaceView, string> = {
  dashboard: '🧾',
  orders: '📦',
  candidates: '🧑‍💼',
  meetings: '📅',
  chats: '💬',
  analytics: '📊',
}

const roleHintMap: Record<WorkspaceRole, string> = {
  Customer: 'Откройте заказ, выберите исполнителя и запустите подбор кандидатов.',
  Executor: 'Откройте проект, добавьте кандидатов и отправьте shortlist заказчику.',
  Applicant: 'Отслеживайте статусы откликов и поддерживайте связь с рекрутерами.',
}

function toViewLabel(view: WorkspaceView, role: WorkspaceRole): string {
  if (role === 'Applicant' && view === 'orders') {
    return 'Вакансии'
  }

  if (role === 'Applicant' && view === 'candidates') {
    return 'Мои резюме'
  }

  return workspaceViewOptions.find((option) => option.value === view)?.label ?? view
}

function toViewIcon(view: WorkspaceView, role: WorkspaceRole): string {
  if (role === 'Applicant' && view === 'orders') {
    return '💼'
  }

  if (role === 'Applicant' && view === 'candidates') {
    return '📄'
  }

  return navIconMap[view]
}

export function Sidebar({
  activeView,
  collapsed,
  counters,
  onToggleCollapse,
  onViewChange,
  role,
}: SidebarProps) {
  const visibleViewOptions =
    role === 'Customer'
      ? workspaceViewOptions.filter(
          (view) => view.value !== 'orders' && view.value !== 'candidates',
        )
      : workspaceViewOptions

  // @dvnull: Ранее sidebar был собран на blue-tailwind карточках, перевел shell на HTML-паттерн макета.
  return (
    <aside className={`preview11-sidebar${collapsed ? ' preview11-sidebar-collapsed' : ''}`}>
      <div className="preview11-brand">
        <div className="preview11-mark">SP</div>
        <div className="preview11-brand-copy">
          <div className="preview11-brand-title">SelectProfi</div>
          <div className="preview11-muted">Платформа подбора специалистов</div>
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

      <nav aria-label="Основные разделы" className="preview11-nav">
        {visibleViewOptions.map((view) => {
          const isActive = activeView === view.value
          const counter = counters[view.value] ?? 0

          return (
            <button
              key={view.value}
              className={`preview11-nav-btn${isActive ? ' preview11-nav-btn-active' : ''}`}
              onClick={() => onViewChange(view.value)}
              type="button"
            >
              <span className="preview11-nav-left">
                <span className="preview11-nav-icon">{toViewIcon(view.value, role)}</span>
                <span className="preview11-nav-label">{toViewLabel(view.value, role)}</span>
              </span>
              {counter > 0 ? <span className="preview11-badge">{counter}</span> : null}
            </button>
          )
        })}
      </nav>

      <div className="preview11-footer">
        <div className="preview11-hint-card">
          <div className="preview11-hint-title">Следующий шаг</div>
          <div className="preview11-muted">{roleHintMap[role]}</div>
        </div>
      </div>
    </aside>
  )
}
