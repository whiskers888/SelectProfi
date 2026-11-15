import { type FormEvent, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TiptapTextEditor } from '@/components/ui/tiptap-text-editor'

function vacancyDescriptionText(value: string): string {
  const html = value.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  parsed.querySelectorAll('script, style').forEach((element) => element.remove())
  return parsed.body.textContent?.replace(/\n{3,}/g, '\n\n').trim() ?? value.trim()
}

function vacancyFileName(title: string): string {
  const normalized = title.trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-')
  return `${normalized.slice(0, 80) || 'vacancy'}.txt`
}

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
  const [exportError, setExportError] = useState<string | null>(null)
  const hasVisibleDescriptionText = formValues.description.replace(/<[^>]*>/g, ' ').trim().length > 0
  const isFormInvalid = !formValues.title.trim() || !hasVisibleDescriptionText
  const isAnySubmitInProgress = isCreatingVacancy || isSendingVacancyToCustomer

  const handleDownloadText = () => {
    const description = vacancyDescriptionText(formValues.description)
    const content = `${formValues.title.trim()}\n\n${description}\n`
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = vacancyFileName(formValues.title)
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setExportError(null)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) {
      setExportError('Разрешите всплывающее окно, чтобы распечатать вакансию или сохранить её в PDF.')
      return
    }

    printWindow.opener = null
    const printDocument = printWindow.document
    printDocument.title = formValues.title.trim() || 'Вакансия'
    printDocument.documentElement.lang = 'ru'

    const style = printDocument.createElement('style')
    style.textContent =
      '@page { margin: 20mm; } body { color: CanvasText; font: 12pt/1.55 system-ui, sans-serif; } h1 { font-size: 22pt; line-height: 1.2; } article { max-width: 780px; margin: 0 auto; } p { white-space: pre-wrap; }'
    const article = printDocument.createElement('article')
    const heading = printDocument.createElement('h1')
    heading.textContent = formValues.title.trim()
    const description = printDocument.createElement('p')
    description.textContent = vacancyDescriptionText(formValues.description)
    article.append(heading, description)
    printDocument.body.replaceChildren(style, article)

    printWindow.addEventListener('afterprint', () => printWindow.close(), { once: true })
    printWindow.focus()
    printWindow.print()
    setExportError(null)
  }

  return (
    <Card className="rounded-xl border-border p-4 shadow-none">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Создание вакансии</h3>
        {hasDraftIndicator ? <Badge variant="default">Черновик сохранен</Badge> : null}
        <p className="text-sm text-muted-foreground">Вакансия будет создана в статусе Draft и привязана к выбранному заказу.</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
        <p className="text-sm text-muted-foreground">Экспорт включает название и описание вакансии.</p>
        <div className="flex flex-wrap gap-2">
          <Button
            className="h-9 rounded-lg border-border"
            disabled={isAnySubmitInProgress || isFormInvalid}
            onClick={handleDownloadText}
            type="button"
            variant="outline"
          >
            <Download aria-hidden="true" size={15} />
            Скачать TXT
          </Button>
          <Button
            className="h-9 rounded-lg border-border"
            disabled={isAnySubmitInProgress || isFormInvalid}
            onClick={handlePrint}
            type="button"
            variant="outline"
          >
            <Printer aria-hidden="true" size={15} />
            Печать / PDF
          </Button>
        </div>
      </div>
      {exportError ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {exportError}
        </p>
      ) : null}

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
