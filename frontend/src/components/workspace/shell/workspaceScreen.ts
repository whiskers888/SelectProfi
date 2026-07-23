import type { WorkspaceView } from '../model/data'

export type WorkspacePrimaryScreen =
  | 'feed'
  | 'profile'
  | 'create-order'
  | 'create-vacancy'
  | 'create-candidate'
  | 'create-applicant-response'

export type WorkspaceScreen = WorkspacePrimaryScreen | 'order-details' | 'candidate-details'

export type WorkspaceScreenState = {
  current: WorkspacePrimaryScreen
  returnTo: WorkspacePrimaryScreen
}

export function createWorkspaceScreenState(isProfileRoute: boolean): WorkspaceScreenState {
  const initialScreen = isProfileRoute ? 'profile' : 'feed'
  return { current: initialScreen, returnTo: initialScreen }
}

export function openWorkspaceScreen(
  state: WorkspaceScreenState,
  screen: WorkspacePrimaryScreen,
): WorkspaceScreenState {
  if (state.current === screen) {
    return state
  }

  const returnTo =
    state.current === 'feed' || state.current === 'profile' ? state.current : state.returnTo

  return { current: screen, returnTo }
}

export function closeWorkspaceScreen(
  state: WorkspaceScreenState,
  screen: WorkspacePrimaryScreen,
): WorkspaceScreenState {
  if (state.current !== screen) {
    return state
  }

  return { current: state.returnTo, returnTo: state.returnTo }
}

export function syncWorkspaceScreenRoute(
  state: WorkspaceScreenState,
  isProfileRoute: boolean,
): WorkspaceScreenState {
  const routeScreen = isProfileRoute ? 'profile' : 'feed'
  const isCreateScreen = state.current !== 'feed' && state.current !== 'profile'

  if (state.current === routeScreen || (isCreateScreen && state.returnTo === routeScreen)) {
    return state
  }

  return { current: routeScreen, returnTo: routeScreen }
}

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
