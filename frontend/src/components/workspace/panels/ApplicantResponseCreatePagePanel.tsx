import { type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type ApplicantResponseCreatePagePanelProps = {
  formValues: {
    vacancy: string
    company: string
    note: string
  }
  onBack: () => void
  onFieldChange: (field: 'vacancy' | 'company' | 'note', value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
}

export function ApplicantResponseCreatePagePanel({
  formValues,
  onBack,
  onFieldChange,
  onSubmit,
}: ApplicantResponseCreatePagePanelProps) {
  const isFormInvalid = !formValues.vacancy.trim() || !formValues.company.trim()

  return (
    <Card className="rounded-xl border-slate-200 p-4 shadow-none">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900">Создание отклика</h3>
        <p className="text-sm text-slate-600">
          Добавьте информацию по отклику в отдельной странице внутри рабочего пространства.
        </p>
      </div>

      <Alert className="mt-4">Форма открыта из кнопки хедера без использования модалки.</Alert>

      <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-response-vacancy">
            Вакансия
          </Label>
          <Input
            id="workspace-response-vacancy"
            value={formValues.vacancy}
            onChange={(event) => onFieldChange('vacancy', event.target.value)}
            placeholder="Например, Senior React Developer"
            maxLength={200}
            required
            className="h-11 rounded-xl border-slate-200 text-slate-900"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-response-company">
            Компания
          </Label>
          <Input
            id="workspace-response-company"
            value={formValues.company}
            onChange={(event) => onFieldChange('company', event.target.value)}
            placeholder="ООО Альфа"
            maxLength={200}
            required
            className="h-11 rounded-xl border-slate-200 text-slate-900"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-response-note">
            Комментарий
          </Label>
          <Textarea
            id="workspace-response-note"
            value={formValues.note}
            onChange={(event) => onFieldChange('note', event.target.value)}
            placeholder="Краткое сопроводительное сообщение."
            maxLength={2000}
            className="min-h-[120px] rounded-xl border-slate-200 text-slate-900"
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            className="h-10 rounded-xl border-slate-200 text-slate-700"
            onClick={onBack}
            type="button"
            variant="outline"
          >
            Назад
          </Button>
          <Button
            className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            type="submit"
            disabled={isFormInvalid}
          >
            Создать отклик
          </Button>
        </div>
      </form>
    </Card>
  )
}
