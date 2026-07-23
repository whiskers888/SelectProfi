import { describe, expect, it } from 'vitest'
import { resolveWorkspaceScreen } from './workspaceScreen'

describe('workspace screen resolver', () => {
  it('shows details only when primary screen is feed', () => {
    expect(
      resolveWorkspaceScreen('profile', {
        activeView: 'dashboard',
        hasSelectedCandidate: true,
        hasSelectedOrder: true,
      }),
    ).toBe('profile')

    expect(
      resolveWorkspaceScreen('feed', {
        activeView: 'dashboard',
        hasSelectedCandidate: true,
        hasSelectedOrder: true,
      }),
    ).toBe('candidate-details')
  })

  it('keeps a history-driven create screen above details', () => {
    expect(
      resolveWorkspaceScreen('create-candidate', {
        activeView: 'dashboard',
        hasSelectedCandidate: true,
        hasSelectedOrder: true,
      }),
    ).toBe('create-candidate')
  })
})
