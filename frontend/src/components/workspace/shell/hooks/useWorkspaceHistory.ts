import { useCallback } from 'react'
import type { Location, NavigateFunction } from 'react-router-dom'
import type { WorkspaceCreateScreen } from '../workspaceScreen'
import {
  readWorkspaceHistoryEntry,
  withWorkspaceHistoryEntry,
  withoutWorkspaceHistoryEntry,
} from '../workspaceHistory'

export function useWorkspaceHistory(location: Location, navigate: NavigateFunction) {
  const entry = readWorkspaceHistoryEntry(location.state)

  const openCreateScreen = useCallback(
    (screen: WorkspaceCreateScreen) => {
      if (entry?.kind === 'create' && entry.screen === screen) {
        return
      }

      navigate(
        { pathname: location.pathname, search: location.search },
        {
          state: withWorkspaceHistoryEntry(location.state, { kind: 'create', screen }),
        },
      )
    },
    [entry, location.pathname, location.search, location.state, navigate],
  )

  const dismissCreateScreen = useCallback(
    (screen: WorkspaceCreateScreen) => {
      if (entry?.kind !== 'create' || entry.screen !== screen) {
        return false
      }

      navigate(
        { pathname: location.pathname, search: location.search },
        {
          replace: true,
          state: withoutWorkspaceHistoryEntry(location.state),
        },
      )
      return true
    },
    [entry, location.pathname, location.search, location.state, navigate],
  )

  const goBackFromCreateScreen = useCallback(
    (screen: WorkspaceCreateScreen) => {
      if (entry?.kind !== 'create' || entry.screen !== screen) {
        return false
      }

      navigate(-1)
      return true
    },
    [entry, navigate],
  )

  const goBackFromDetails = useCallback(() => {
    if (entry?.kind !== 'details') {
      return false
    }

    navigate(-1)
    return true
  }, [entry, navigate])

  return {
    dismissCreateScreen,
    entry,
    goBackFromCreateScreen,
    goBackFromDetails,
    openCreateScreen,
  }
}
