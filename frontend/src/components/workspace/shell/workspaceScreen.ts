import type { WorkspaceView } from '../model/data'

export type WorkspacePrimaryScreen =
  | 'feed'
  | 'profile'
  | 'create-order'
  | 'create-vacancy'
  | 'create-candidate'
  | 'create-applicant-response'

export type WorkspaceCreateScreen = Exclude<WorkspacePrimaryScreen, 'feed' | 'profile'>
export type WorkspaceScreen = WorkspacePrimaryScreen | 'order-details' | 'candidate-details'

export function resolveWorkspaceScreen(
  primaryScreen: WorkspacePrimaryScreen,
  options: {
    activeView: WorkspaceView
    hasSelectedCandidate: boolean
    hasSelectedOrder: boolean
  },
): WorkspaceScreen {
  if (primaryScreen !== 'feed') {
    return primaryScreen
  }

  if (options.hasSelectedCandidate) {
    return 'candidate-details'
  }

  if (options.hasSelectedOrder && options.activeView !== 'orders') {
    return 'order-details'
  }

  return 'feed'
}
