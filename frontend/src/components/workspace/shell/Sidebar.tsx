import { workspaceViewOptions, type WorkspaceRole, type WorkspaceView } from '../model/data'

type SidebarProps = {
  activeView: WorkspaceView
  counters: Partial<Record<WorkspaceView, number>>
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

export function Sidebar({
  activeView,
  counters,
  onViewChange,
  role,
}: SidebarProps) {
  // @dvnull: Ранее sidebar был собран на blue-tailwind карточках, перевел shell на HTML-паттерн макета.
  return (
    <aside className="preview11-sidebar">
      <div className="preview11-brand">
        <div className="preview11-mark">SP</div>
        <div className="preview11-brand-copy">
          <div className="preview11-brand-title">SelectProfi</div>
          <div className="preview11-muted">Платформа подбора специалистов</div>
        </div>
        <button aria-label="Свернуть навигацию" className="preview11-side-btn" type="button">
          ⇤
        </button>
      </div>

      <nav aria-label="Основные разделы" className="preview11-nav">
        {workspaceViewOptions.map((view) => {
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
                <span className="preview11-nav-icon">{navIconMap[view.value]}</span>
                <span className="preview11-nav-label">{view.label}</span>
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
