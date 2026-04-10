import { type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShellPage } from '@/components/preview'
import { useGetCustomerAreaStatusQuery, useGetMyAuthInfoQuery } from '@/shared/api/auth'
import { useGetHealthQuery } from '@/shared/api/generated/openapi'
import { useGetHealthDependenciesQuery } from '@/shared/api/health'
import { OrdersPage } from './OrdersPage'
import { ProfilePage } from './ProfilePage'
import { VacanciesPage } from './VacanciesPage'

type PreviewWorkspace = 'preview' | 'orders' | 'vacancies' | 'profile' | 'system'

type WorkspaceOption = {
  label: string
  value: PreviewWorkspace
}

const workspaceOptions: WorkspaceOption[] = [
  { value: 'preview', label: 'Preview' },
  { value: 'orders', label: 'Orders API' },
  { value: 'vacancies', label: 'Vacancies API' },
  { value: 'profile', label: 'Profile API' },
  { value: 'system', label: 'System API' },
]

function parseWorkspace(value: string | null): PreviewWorkspace {
  if (
    value === 'orders' ||
    value === 'vacancies' ||
    value === 'preview' ||
    value === 'profile' ||
    value === 'system'
  ) {
    return value
  }

  return 'preview'
}

type ProblemDetailsPayload = {
  detail?: string
  title?: string
}

function isProblemDetailsPayload(value: unknown): value is ProblemDetailsPayload {
  return typeof value === 'object' && value !== null
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

function getRequestErrorMessage(error: unknown): string {
  if (!isFetchBaseQueryError(error)) {
    return 'Не удалось выполнить запрос.'
  }

  if (error.status === 'FETCH_ERROR') {
    return 'Не удалось установить соединение с сервером.'
  }

  if (error.status === 401) {
    return 'Требуется авторизация.'
  }

  if (typeof error.status === 'number' && isProblemDetailsPayload(error.data)) {
    return error.data.detail ?? error.data.title ?? 'Не удалось выполнить запрос.'
  }

  return 'Не удалось выполнить запрос.'
}

function SystemApiWorkspace() {
  const {
    data: authMe,
    isFetching: isAuthMeFetching,
    error: authMeError,
    refetch: refetchAuthMe,
  } = useGetMyAuthInfoQuery()
  const {
    data: customerAreaStatus,
    isFetching: isCustomerAreaFetching,
    error: customerAreaError,
    refetch: refetchCustomerArea,
  } = useGetCustomerAreaStatusQuery()
  const {
    isFetching: isHealthFetching,
    error: healthError,
    refetch: refetchHealth,
  } = useGetHealthQuery()
  const {
    data: healthDependencies,
    isFetching: isHealthDependenciesFetching,
    error: healthDependenciesError,
    refetch: refetchHealthDependencies,
  } = useGetHealthDependenciesQuery()

  const healthChecks = healthDependencies?.checks ?? []

  return (
    <section className="page profile-page">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl">System API (Auth + Health)</CardTitle>
          <Button
            onClick={() => {
              void refetchAuthMe()
              void refetchCustomerArea()
              void refetchHealth()
              void refetchHealthDependencies()
            }}
            type="button"
            variant="outline"
          >
            Обновить статусы
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">GET /api/auth/me</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isAuthMeFetching ? <Alert>Загрузка...</Alert> : null}
              {authMeError ? <Alert variant="destructive">{getRequestErrorMessage(authMeError)}</Alert> : null}
              {authMe ? (
                <Alert variant="success">
                  userId={authMe.userId}, role={authMe.role}, email={authMe.email}
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">GET /api/auth/customer-area</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isCustomerAreaFetching ? <Alert>Загрузка...</Alert> : null}
              {customerAreaError ? (
                <Alert variant="destructive">{getRequestErrorMessage(customerAreaError)}</Alert>
              ) : null}
              {customerAreaStatus ? <Alert variant="success">status={customerAreaStatus.status}</Alert> : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">GET /health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isHealthFetching ? <Alert>Загрузка...</Alert> : null}
              {healthError ? <Alert variant="destructive">{getRequestErrorMessage(healthError)}</Alert> : null}
              {!isHealthFetching && !healthError ? <Alert variant="success">Сервис доступен.</Alert> : null}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">GET /health/dependencies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isHealthDependenciesFetching ? <Alert>Загрузка...</Alert> : null}
              {healthDependenciesError ? (
                <Alert variant="destructive">{getRequestErrorMessage(healthDependenciesError)}</Alert>
              ) : null}
              {healthDependencies ? (
                <Alert variant="success">
                  status={healthDependencies.status}, totalDurationMs={healthDependencies.totalDurationMs}
                </Alert>
              ) : null}
              {healthChecks.map((check) => (
                <Alert key={check.name}>
                  {check.name}: {check.status} ({check.durationMs} ms)
                </Alert>
              ))}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </section>
  )
}

export function PreviewPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const workspace = parseWorkspace(searchParams.get('workspace'))

  const content = useMemo(() => {
    if (workspace === 'orders') {
      return <OrdersPage />
    }

    if (workspace === 'vacancies') {
      return <VacanciesPage />
    }

    if (workspace === 'profile') {
      return <ProfilePage />
    }

    if (workspace === 'system') {
      return <SystemApiWorkspace />
    }

    return <ShellPage />
  }, [workspace])

  function handleWorkspaceChange(nextWorkspace: PreviewWorkspace) {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (nextWorkspace === 'preview') {
      nextSearchParams.delete('workspace')
    } else {
      nextSearchParams.set('workspace', nextWorkspace)
    }

    setSearchParams(nextSearchParams)
  }

  return (
    <div className="space-y-4">
      <section className="page profile-page">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {workspaceOptions.map((option) => (
              <button
                key={option.value}
                className={
                  workspace === option.value
                    ? 'rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white'
                    : 'rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
                }
                onClick={() => handleWorkspaceChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>
      {content}
    </div>
  )
}
