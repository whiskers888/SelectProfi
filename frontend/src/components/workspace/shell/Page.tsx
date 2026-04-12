import '../styles/shell.css'
import { WorkspaceShellView } from './WorkspaceShellView'
import { useWorkspaceShellController } from './hooks/useWorkspaceShellController'

export function ShellPage() {
  const viewModel = useWorkspaceShellController()
  return <WorkspaceShellView {...viewModel} />
}
