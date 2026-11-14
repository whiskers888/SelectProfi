import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { WorkspaceRole, WorkspaceView } from '../../model/data'
import { useWorkspaceUiActions } from './useWorkspaceUiActions'

afterEach(cleanup)

type CreateActionCallbacks = {
  setActiveView?: (view: WorkspaceView) => void
  setApplicantResponsePageOpen?: (isOpen: boolean) => void
  setCandidatePageOpen?: (isOpen: boolean) => void
  setCandidateVacancyId?: (vacancyId: string | null) => void
  setOrderPageOpen?: (isOpen: boolean) => void
  onOrderFormValuesChange?: () => void
}

function createActionDependencies(role: WorkspaceRole, callbacks: CreateActionCallbacks = {}) {
  return {
    customerCompanyName: 'ООО Альфа',
    role,
    setActiveView: callbacks.setActiveView ?? (() => undefined),
    setBanner: () => undefined,
    setCreateOrderFormValues: callbacks.onOrderFormValuesChange ?? (() => undefined),
    setIsCreateApplicantResponsePageOpen:
      callbacks.setApplicantResponsePageOpen ?? (() => undefined),
    setIsCreateCandidatePageOpen: callbacks.setCandidatePageOpen ?? (() => undefined),
    setCreateCandidateVacancyId: callbacks.setCandidateVacancyId ?? (() => undefined),
    setIsCreateOrderPageOpen: callbacks.setOrderPageOpen ?? (() => undefined),
    onOpenProfile: () => undefined,
    onLogout: () => undefined,
  }
}

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

describe('useWorkspaceUiActions Applicant create action', () => {
  it('opens vacancies instead of the unsupported local resume form', () => {
    const activeViews: WorkspaceView[] = []
    const applicantResponsePageStates: boolean[] = []

    const dependencies = createActionDependencies('Applicant', {
      setActiveView: (view) => activeViews.push(view),
      setApplicantResponsePageOpen: (isOpen) => applicantResponsePageStates.push(isOpen),
    })
    const { result } = renderHook(() => useWorkspaceUiActions(dependencies))

    act(() => result.current.handleHeaderCreateAction())

    expect(activeViews).toEqual(['orders'])
    expect(applicantResponsePageStates).toEqual([false])
  })

  it('preserves Customer order creation', () => {
    const activeViews: WorkspaceView[] = []
    const orderPageStates: boolean[] = []
    let orderFormUpdateCount = 0
    const dependencies = createActionDependencies('Customer', {
      setActiveView: (view) => activeViews.push(view),
      setOrderPageOpen: (isOpen) => orderPageStates.push(isOpen),
      onOrderFormValuesChange: () => {
        orderFormUpdateCount += 1
      },
    })
    const { result } = renderHook(() => useWorkspaceUiActions(dependencies))

    act(() => result.current.handleHeaderCreateAction())

    expect(activeViews).toEqual(['dashboard'])
    expect(orderPageStates).toEqual([true])
    expect(orderFormUpdateCount).toBe(1)
  })

  it('preserves Executor candidate creation', () => {
    const activeViews: WorkspaceView[] = []
    const candidatePageStates: boolean[] = []
    const candidateVacancyIds: Array<string | null> = []
    const dependencies = createActionDependencies('Executor', {
      setActiveView: (view) => activeViews.push(view),
      setCandidatePageOpen: (isOpen) => candidatePageStates.push(isOpen),
      setCandidateVacancyId: (vacancyId) => candidateVacancyIds.push(vacancyId),
    })
    const { result } = renderHook(() => useWorkspaceUiActions(dependencies))

    act(() => result.current.handleHeaderCreateAction())

    expect(activeViews).toEqual(['dashboard', 'candidates'])
    expect(candidatePageStates).toEqual([true])
    expect(candidateVacancyIds).toEqual([null])
  })
})
