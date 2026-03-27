import { useGetHealthQuery } from '../shared/api/generated/openapi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ApiStatus = 'loading' | 'error' | 'ok'

export function DashboardPage() {
  const { isLoading, isError, refetch } = useGetHealthQuery()
  const apiStatus: ApiStatus = isLoading ? 'loading' : isError ? 'error' : 'ok'

  const statusLabel: Record<ApiStatus, string> = {
    loading: 'Проверка API...',
    error: 'Ошибка соединения',
    ok: 'Сервис доступен',
  }

  const statusClassName: Record<ApiStatus, string> = {
    loading: 'bg-secondary text-secondary-foreground',
    error: 'bg-destructive/10 text-destructive',
    ok: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <section className="page grid gap-4">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Dashboard</CardTitle>
          <CardDescription>Мониторинг состояния backend API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Статус API:</span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                statusClassName[apiStatus],
              )}
            >
              {statusLabel[apiStatus]}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="button" variant="outline" onClick={() => void refetch()} disabled={isLoading}>
            Обновить статус
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
