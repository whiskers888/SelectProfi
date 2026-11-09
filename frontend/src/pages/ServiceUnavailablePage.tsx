import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { routePaths } from '@/app/routePaths'
import type { RootState } from '@/app/store'

function getReturnTo(search: string): string {
  const returnTo = new URLSearchParams(search).get('returnTo')
  return returnTo && returnTo.startsWith('/') && !returnTo.startsWith(routePaths.serviceUnavailable)
    ? returnTo
    : routePaths.app
}

export function ServiceUnavailablePage() {
  const isBackendUnavailable = useSelector((state: RootState) => state.runtimeStatus.isBackendUnavailable)
  const location = useLocation()
  const returnTo = getReturnTo(location.search)

  if (!isBackendUnavailable) {
    return <Navigate to={returnTo} replace />
  }

  return (
    <main className="min-h-screen bg-muted px-4 py-10 text-foreground">
      <section className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Сервис временно недоступен</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Не удалось подключиться к серверу.
        </p>
        <button
          type="button"
          className="mt-6 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-foreground/85"
          onClick={() => window.location.assign(returnTo)}
        >
          Повторить
        </button>
      </section>
    </main>
  )
}
