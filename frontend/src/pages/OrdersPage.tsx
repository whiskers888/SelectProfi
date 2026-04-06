import { type ChangeEvent, useMemo, useState } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Link } from 'react-router-dom'
import { routePaths } from '@/app/routePaths'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useOrdersServer } from '@/features/orders/model'
import { useGetMyAuthInfoQuery } from '@/shared/api/auth'

type ProblemDetailsPayload = {
  code?: string
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
    if (error.data.code === 'executor_not_found') {
      return 'Указанный рекрутер не найден.'
    }

    return error.data.detail ?? error.data.title ?? 'Не удалось выполнить запрос.'
  }

  return 'Не удалось выполнить запрос.'
}

export function OrdersPage() {
  const { data, error, isError, isLoading, isUpdatingOrder, refetch, updateOrder } = useOrdersServer()
  const { data: authMe } = useGetMyAuthInfoQuery()
  const [executorIdsByOrder, setExecutorIdsByOrder] = useState<Record<string, string>>({})
  const [submitMessage, setSubmitMessage] = useState<{ status: 'idle' | 'success' | 'error'; text: string }>(
    { status: 'idle', text: '' },
  )

  const items = data?.items ?? []
  const canAssignExecutor = authMe?.role === 'Customer'

  const canRenderTable = useMemo(() => !isLoading && !isError && items.length > 0, [isError, isLoading, items.length])

  async function handleAssignExecutor(orderId: string) {
    if (!canAssignExecutor) {
      setSubmitMessage({ status: 'error', text: 'Назначать рекрутера может только заказчик.' })
      return
    }

    const rawExecutorId = (executorIdsByOrder[orderId] ?? '').trim()

    if (!rawExecutorId) {
      setSubmitMessage({ status: 'error', text: 'Укажите executorId перед назначением.' })
      return
    }

    try {
      await updateOrder({
        orderId,
        body: { executorId: rawExecutorId },
      }).unwrap()

      setSubmitMessage({ status: 'success', text: 'Рекрутер назначен.' })
      await refetch()
    } catch (requestError) {
      setSubmitMessage({ status: 'error', text: getRequestErrorMessage(requestError) })
    }
  }

  function handleExecutorInputChange(orderId: string, event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value
    setExecutorIdsByOrder((previous) => ({
      ...previous,
      [orderId]: nextValue,
    }))
  }

  return (
    <section className="page profile-page">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xl">Заказы</CardTitle>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Обновить
            </Button>
            <Button asChild type="button" variant="ghost">
              <Link to={routePaths.app}>В preview</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? <Alert>Загрузка заказов...</Alert> : null}
          {isError ? <Alert variant="destructive">{getRequestErrorMessage(error)}</Alert> : null}
          {submitMessage.status !== 'idle' ? (
            <Alert variant={submitMessage.status === 'error' ? 'destructive' : 'success'}>
              {submitMessage.text}
            </Alert>
          ) : null}
          {!isLoading && !isError && !canAssignExecutor ? (
            <Alert>Назначение рекрутера доступно только для роли заказчика.</Alert>
          ) : null}
          {!isLoading && !isError && items.length === 0 ? (
            <Alert>Пока нет заказов.</Alert>
          ) : null}

          {canRenderTable ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заголовок</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>ExecutorId</TableHead>
                  <TableHead className="w-[240px]">Назначение</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.title}</TableCell>
                    <TableCell>{order.description}</TableCell>
                    <TableCell>{order.executorId ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Input
                          value={executorIdsByOrder[order.id] ?? order.executorId ?? ''}
                          onChange={(event) => handleExecutorInputChange(order.id, event)}
                          placeholder="executorId (GUID)"
                          disabled={!canAssignExecutor}
                        />
                        <Button
                          type="button"
                          onClick={() => void handleAssignExecutor(order.id)}
                          disabled={isUpdatingOrder || !canAssignExecutor}
                        >
                          Назначить
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
