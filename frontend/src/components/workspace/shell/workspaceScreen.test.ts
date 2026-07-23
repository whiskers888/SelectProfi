import { describe, expect, it } from 'vitest'
import {
  closeWorkspaceScreen,
  createWorkspaceScreenState,
  openWorkspaceScreen,
  resolveWorkspaceScreen,
  syncWorkspaceScreenRoute,
} from './workspaceScreen'

describe('workspace screen state', () => {
  it('keeps exactly one create screen and returns to profile', () => {
    const profile = createWorkspaceScreenState(true)
    const createOrder = openWorkspaceScreen(profile, 'create-order')

    expect(createOrder).toEqual({ current: 'create-order', returnTo: 'profile' })
    expect(closeWorkspaceScreen(createOrder, 'create-order')).toEqual({
      current: 'profile',
      returnTo: 'profile',
    })
  })

  it('replaces one create screen with another', () => {
    const initial = createWorkspaceScreenState(false)
    const createOrder = openWorkspaceScreen(initial, 'create-order')
    const createCandidate = openWorkspaceScreen(createOrder, 'create-candidate')

    expect(createCandidate).toEqual({ current: 'create-candidate', returnTo: 'feed' })
    expect(closeWorkspaceScreen(createCandidate, 'create-candidate')).toEqual(initial)
  })

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

  it('synchronizes browser back and forward with the base route', () => {
    const createFromProfile = openWorkspaceScreen(
      createWorkspaceScreenState(true),
      'create-order',
    )

    expect(syncWorkspaceScreenRoute(createFromProfile, true)).toBe(createFromProfile)
    expect(syncWorkspaceScreenRoute(createFromProfile, false)).toEqual({
      current: 'feed',
      returnTo: 'feed',
    })
    expect(syncWorkspaceScreenRoute(createWorkspaceScreenState(false), true)).toEqual({
      current: 'profile',
      returnTo: 'profile',
    })
  })
})
