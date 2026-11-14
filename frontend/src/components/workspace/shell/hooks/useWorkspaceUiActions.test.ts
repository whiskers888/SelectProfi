import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useWorkspaceUiActions } from './useWorkspaceUiActions'

afterEach(cleanup)

describe('useWorkspaceUiActions chat delivery', () => {
  it('reports that chat is unavailable instead of claiming a local message was sent', () => {
    const banners: Array<{ message: string; variant: 'default' | 'success' | 'destructive' }> = []
    const { result } = renderHook(() =>
      useWorkspaceUiActions({
        customerCompanyName: '',
        role: 'Customer',
        setActiveView: () => undefined,
        setBanner: (banner) => banners.push(banner),
        setCreateOrderFormValues: () => undefined,
        setIsCreateApplicantResponsePageOpen: () => undefined,
        setIsCreateCandidatePageOpen: () => undefined,
        setCreateCandidateVacancyId: () => undefined,
        setIsCreateOrderPageOpen: () => undefined,
        onOpenProfile: () => undefined,
        onLogout: () => undefined,
      }),
    )

    act(() => result.current.handleSendMessage())

    expect(banners).toEqual([
      {
        variant: 'destructive',
        message: 'Отправка сообщений недоступна: чат не подключён.',
      },
    ])
  })
})
