import { useHealthServer } from '@/features/dashboard/model'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const { isLoading, isError, refetch } = useHealthServer()

  // @dvnull: Ветки loading/error переведены на единый UX-шаблон состояний с явным retry.
  if (isLoading) {
    return (
      <section className="page grid gap-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Dashboard</CardTitle>
            <CardDescription>Мониторинг состояния backend API</CardDescription>
          </CardHeader>
          <CardContent>
            <p role="status" className="text-sm text-muted-foreground">
              Проверка API...
            </p>
          </CardContent>
          <CardFooter>
            <Button type="button" variant="outline" disabled>
              Обновить статус
            </Button>
          </CardFooter>
        </Card>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="page grid gap-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Dashboard</CardTitle>
            <CardDescription>Мониторинг состояния backend API</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" role="alert">
              Ошибка соединения
            </Alert>
          </CardContent>
          <CardFooter>
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Повторить
            </Button>
          </CardFooter>
        </Card>
      </section>
    )
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
                'bg-success-muted text-success-foreground',
              )}
            >
              Сервис доступен
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            Обновить статус
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
