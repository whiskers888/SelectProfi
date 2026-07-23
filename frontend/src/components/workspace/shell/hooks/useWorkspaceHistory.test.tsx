import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { useWorkspaceHistory } from './useWorkspaceHistory'

afterEach(cleanup)

function HistoryHarness() {
  const location = useLocation()
  const navigate = useNavigate()
  const { dismissCreateScreen, entry, goBackFromCreateScreen, openCreateScreen } =
    useWorkspaceHistory(location, navigate)

  return (
    <>
      <output data-testid="screen">{entry?.kind === 'create' ? entry.screen : 'base'}</output>
      <button onClick={() => openCreateScreen('create-order')}>create</button>
      <button onClick={() => goBackFromCreateScreen('create-order')}>back</button>
      <button onClick={() => dismissCreateScreen('create-order')}>dismiss</button>
    </>
  )
}

function createTestRouter() {
  return createMemoryRouter([{ path: '/app', element: <HistoryHarness /> }], {
    initialEntries: ['/app'],
  })
}

describe('useWorkspaceHistory', () => {
  it('restores create screen with browser back and forward', async () => {
    const router = createTestRouter()
    render(<RouterProvider router={router} />)

    fireEvent.click(screen.getByText('create'))
    expect(screen.getByTestId('screen')).toHaveTextContent('create-order')

    fireEvent.click(screen.getByText('back'))
    await waitFor(() => expect(screen.getByTestId('screen')).toHaveTextContent('base'))

    await router.navigate(1)
    await waitFor(() => expect(screen.getByTestId('screen')).toHaveTextContent('create-order'))
  })

  it('replaces a completed create entry instead of reopening it', async () => {
    const router = createTestRouter()
    render(<RouterProvider router={router} />)

    fireEvent.click(screen.getByText('create'))
    fireEvent.click(screen.getByText('dismiss'))
    expect(screen.getByTestId('screen')).toHaveTextContent('base')

    await router.navigate(-1)
    await waitFor(() => expect(screen.getByTestId('screen')).toHaveTextContent('base'))
  })
})
