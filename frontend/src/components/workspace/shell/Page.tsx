import '../styles/shell.css'
import { WorkspaceShellView } from './WorkspaceShellView'
import { useWorkspaceShellController } from './hooks/useWorkspaceShellController'

function ShellBootstrapLoader() {
  return (
    <div className="preview11-html">
      <div className="preview11-boot">
        <div className="preview11-boot-card" role="status" aria-live="polite" aria-busy="true">
          <div className="preview11-brand preview11-brand-boot">
            <div className="preview11-mark">SP</div>
            <div className="preview11-brand-copy">
              <div className="preview11-brand-title">SelectProfi</div>
              <div className="preview11-muted">Проверяем доступ и подготавливаем рабочее пространство</div>
            </div>
          </div>

          <div className="preview11-loading">
            <span aria-hidden="true" className="preview11-loading-spin" />
            <span>Загружаем данные профиля...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ShellPage() {
  const viewModel = useWorkspaceShellController()
  if (viewModel.isBootstrapLoading) {
    return <ShellBootstrapLoader />
  }
  return <WorkspaceShellView {...viewModel} />
}
