import { describe, expect, it } from 'vitest'
import {
  readWorkspaceHistoryEntry,
  withWorkspaceHistoryEntry,
  withoutWorkspaceHistoryEntry,
} from './workspaceHistory'

describe('workspace history state', () => {
  it('stores a create screen without losing foreign router state', () => {
    const state = withWorkspaceHistoryEntry(
      { foreign: 'keep' },
      { kind: 'create', screen: 'create-order' },
    )

    expect(readWorkspaceHistoryEntry(state)).toEqual({
      kind: 'create',
      screen: 'create-order',
    })
    expect(state.foreign).toBe('keep')
  })

  it('removes only the workspace entry', () => {
    const state = withWorkspaceHistoryEntry(
      { foreign: 'keep' },
      { kind: 'create', screen: 'create-candidate' },
    )

    expect(withoutWorkspaceHistoryEntry(state)).toEqual({ foreign: 'keep' })
    expect(withoutWorkspaceHistoryEntry({ selectProfiWorkspace: { kind: 'details' } })).toBeNull()
  })

  it('rejects malformed or stale entries', () => {
    expect(readWorkspaceHistoryEntry(null)).toBeNull()
    expect(
      readWorkspaceHistoryEntry({
        selectProfiWorkspace: { kind: 'create', screen: 'removed-screen' },
      }),
    ).toBeNull()
  })
})
