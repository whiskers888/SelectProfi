import { type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TiptapTextEditor } from '@/components/ui/tiptap-text-editor'

type VacancyCreatePagePanelProps = {
  formValues: {
    title: string
    description: string
  }
  isCreatingVacancy: boolean
  isSendingVacancyToCustomer: boolean
  linkedOrder: {
    id: string
    title: string
  }
  onBack: () => void
  onFieldChange: (field: 'title' | 'description', value: string) => void
  hasDraftIndicator?: boolean
  onSubmitDraft: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onSendToCustomer: () => void | Promise<void>
}

export function VacancyCreatePagePanel({
  formValues,
  isCreatingVacancy,
  isSendingVacancyToCustomer,
  linkedOrder,
  onBack,
  onFieldChange,
  hasDraftIndicator = false,
  onSubmitDraft,
  onSendToCustomer,
}: VacancyCreatePagePanelProps) {
  const hasVisibleDescriptionText = formValues.description.replace(/<[^>]*>/g, ' ').trim().length > 0
  const isFormInvalid = !formValues.title.trim() || !hasVisibleDescriptionText
  const isAnySubmitInProgress = isCreatingVacancy || isSendingVacancyToCustomer

  return (
    <Card className="rounded-xl border-border p-4 shadow-none">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Создание вакансии</h3>
        {hasDraftIndicator ? <Badge variant="default">Черновик сохранен</Badge> : null}
        <p className="text-sm text-muted-foreground">Вакансия будет создана в статусе Draft и привязана к выбранному заказу.</p>
      </div>

      <form className="mt-4 grid gap-4" onSubmit={onSubmitDraft}>
        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="workspace-vacancy-linked-order">
            Заказ
          </Label>
          <Input
            id="workspace-vacancy-linked-order"
            value={`${linkedOrder.title} (${linkedOrder.id})`}
            readOnly
            className="h-11 rounded-xl border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="workspace-vacancy-title">
            Название вакансии
          </Label>
          <Input
            id="workspace-vacancy-title"
            value={formValues.title}
            onChange={(event) => onFieldChange('title', event.target.value)}
            placeholder="Например, Senior Frontend Developer"
            maxLength={200}
            required
            className="h-11 rounded-xl border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">
            Описание
          </Label>
          <TiptapTextEditor
            value={formValues.description}
            onChange={(value) => onFieldChange('description', value)}
            placeholder="Опишите требования, задачи и условия."
            className="rounded-xl border-border text-foreground"
            disabled={isAnySubmitInProgress}
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            className="h-10 rounded-xl border-border text-muted-foreground"
            onClick={onBack}
            type="button"
            variant="outline"
            disabled={isAnySubmitInProgress}
          >
            Назад
          </Button>
          <Button
            className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            type="submit"
            disabled={isAnySubmitInProgress || isFormInvalid}
          >
            {isCreatingVacancy ? 'Сохраняем...' : 'Сохранить черновик'}
          </Button>
          <Button
            className="h-10 rounded-xl bg-foreground text-primary-foreground hover:bg-foreground/85"
            type="button"
            onClick={() => {
              void onSendToCustomer()
            }}
            disabled={isAnySubmitInProgress || isFormInvalid}
          >
            {isSendingVacancyToCustomer ? 'Отправляем...' : 'Отправить заказчику'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
