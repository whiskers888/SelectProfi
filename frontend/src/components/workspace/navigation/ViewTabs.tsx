import { workspaceViewOptions, type WorkspaceView } from '../model/data'

type ViewTabsProps = {
  activeView: WorkspaceView
  onViewChange: (view: WorkspaceView) => void
  counters?: Partial<Record<WorkspaceView, number>>
  className?: string
}

export function ViewTabs({
  activeView,
  className,
  counters,
  onViewChange,
}: ViewTabsProps) {
  const rootClassName = className ? `preview11-nav-tabs ${className}` : 'preview11-nav-tabs'

  // @dvnull: Ранее навигация строилась через Tabs с blue-активным состоянием, переведено на HTML-кнопки h-tab.
  return (
    <div className={rootClassName}>
      {workspaceViewOptions.map((view) => {
        const counter = counters?.[view.value] ?? 0

        return (
          <button
            key={view.value}
            className={`preview11-nav-tab${activeView === view.value ? ' preview11-nav-tab-active' : ''}`}
            onClick={() => onViewChange(view.value)}
            type="button"
          >
            <span>{view.label}</span>
            {counter > 0 ? <span className="preview11-badge">{counter}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
