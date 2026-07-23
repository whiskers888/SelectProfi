import type { WorkspaceCreateScreen } from './workspaceScreen'

const workspaceHistoryStateKey = 'selectProfiWorkspace'

export type WorkspaceHistoryEntry =
  | {
      kind: 'create'
      screen: WorkspaceCreateScreen
    }
  | {
      kind: 'details'
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isWorkspaceCreateScreen(value: unknown): value is WorkspaceCreateScreen {
  return (
    value === 'create-order' ||
    value === 'create-vacancy' ||
    value === 'create-candidate' ||
    value === 'create-applicant-response'
  )
}

export function readWorkspaceHistoryEntry(state: unknown): WorkspaceHistoryEntry | null {
  if (!isRecord(state)) {
    return null
  }

  const entry = state[workspaceHistoryStateKey]
  if (!isRecord(entry)) {
    return null
  }

  if (entry.kind === 'details') {
    return { kind: 'details' }
  }

  if (entry.kind === 'create' && isWorkspaceCreateScreen(entry.screen)) {
    return { kind: 'create', screen: entry.screen }
  }

  return null
}

export function withWorkspaceHistoryEntry(
  state: unknown,
  entry: WorkspaceHistoryEntry,
): Record<string, unknown> {
  return {
    ...(isRecord(state) ? state : {}),
    [workspaceHistoryStateKey]: entry,
  }
}

export function withoutWorkspaceHistoryEntry(state: unknown): Record<string, unknown> | null {
  if (!isRecord(state)) {
    return null
  }

  const nextState = { ...state }
  delete nextState[workspaceHistoryStateKey]
  return Object.keys(nextState).length > 0 ? nextState : null
}
