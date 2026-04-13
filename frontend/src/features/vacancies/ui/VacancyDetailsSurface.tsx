import { type ChangeEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { VacancyResponse } from '@/shared/api/vacancies'

export type VacancyDetailsSurfaceProps = {
  currentVacancyId: string
  isVacancyDetailsFetching: boolean
  vacancyDetailsError: unknown
  vacancyDetailsData: VacancyResponse | undefined
  canEditVacancy: boolean
  canRespondToVacancy: boolean
  isRespondingToVacancy: boolean
  currentVacancyEditTitle: string
  currentVacancyEditDescription: string
  isVacancyEditActionLoading: boolean
  onVacancyEditTitleChange: (event: ChangeEvent<HTMLInputElement>) => void
  onVacancyEditDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onUpdateVacancyDetails: () => void | Promise<void>
  onDeleteVacancy: () => void | Promise<void>
  onRespondToVacancy: () => void | Promise<void>
  getRequestErrorMessage: (error: unknown) => string
}

export function VacancyDetailsSurface({
  currentVacancyId,
  isVacancyDetailsFetching,
  vacancyDetailsError,
  vacancyDetailsData,
  canEditVacancy,
  canRespondToVacancy,
  isRespondingToVacancy,
  currentVacancyEditTitle,
  currentVacancyEditDescription,
  isVacancyEditActionLoading,
  onVacancyEditTitleChange,
  onVacancyEditDescriptionChange,
  onUpdateVacancyDetails,
  onDeleteVacancy,
  onRespondToVacancy,
  getRequestErrorMessage,
}: VacancyDetailsSurfaceProps) {
  function formatShortlistSentAt(value: string | null | undefined): string {
    if (!value) {
      return 'Не отправлено'
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return value
    }

    return parsed.toLocaleString('ru-RU')
  }

  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Карточка вакансии</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!currentVacancyId ? <Alert>Выберите вакансию в списке, чтобы загрузить детали.</Alert> : null}
        {currentVacancyId && isVacancyDetailsFetching ? <Alert>Загрузка деталей вакансии...</Alert> : null}
        {currentVacancyId && vacancyDetailsError ? (
          <Alert variant="destructive">{getRequestErrorMessage(vacancyDetailsError)}</Alert>
        ) : null}
        {currentVacancyId && !isVacancyDetailsFetching && !vacancyDetailsError && vacancyDetailsData ? (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <p>VacancyId: {vacancyDetailsData.id}</p>
              <p>OrderId: {vacancyDetailsData.orderId}</p>
              <p>Status: {vacancyDetailsData.status}</p>
              <p>CustomerId: {vacancyDetailsData.customerId}</p>
              <p>ExecutorId: {vacancyDetailsData.executorId}</p>
              <p>UpdatedAtUtc: {vacancyDetailsData.updatedAtUtc}</p>
              {/* @dvnull: Ранее карточка вакансии не показывала серверный факт авто-отправки shortlist; добавлен явный статус отправки заказчику. */}
              <p>Shortlist to customer: {formatShortlistSentAt(vacancyDetailsData.shortlistSentToCustomerAtUtc)}</p>
            </div>
            {canRespondToVacancy ? (
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="flex-1 text-sm text-slate-700">
                  Для соискателя отклик доступен только по опубликованной вакансии.
                </p>
                <Button
                  type="button"
                  onClick={() => void onRespondToVacancy()}
                  disabled={isRespondingToVacancy || vacancyDetailsData.status !== 'Published'}
                >
                  {isRespondingToVacancy ? 'Отправляем отклик...' : 'Откликнуться'}
                </Button>
              </div>
            ) : null}
            {!canEditVacancy ? <Alert>Редактирование вакансии доступно только для роли исполнителя.</Alert> : null}
            <div className="grid gap-3">
              <Input
                value={currentVacancyEditTitle}
                onChange={onVacancyEditTitleChange}
                placeholder="Название вакансии"
                disabled={!canEditVacancy || isVacancyEditActionLoading}
              />
              <Textarea
                value={currentVacancyEditDescription}
                onChange={onVacancyEditDescriptionChange}
                placeholder="Описание вакансии"
                disabled={!canEditVacancy || isVacancyEditActionLoading}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => void onUpdateVacancyDetails()}
                  disabled={
                    !canEditVacancy ||
                    isVacancyEditActionLoading ||
                    !currentVacancyEditTitle.trim() ||
                    !currentVacancyEditDescription.trim()
                  }
                >
                  Сохранить изменения
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void onDeleteVacancy()}
                  disabled={!canEditVacancy || isVacancyEditActionLoading}
                >
                  Удалить вакансию
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
