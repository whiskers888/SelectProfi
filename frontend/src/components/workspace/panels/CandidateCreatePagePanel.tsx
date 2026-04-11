import { type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type CandidateCreatePagePanelProps = {
  formValues: {
    fullName: string
    specialization: string
    note: string
  }
  onBack: () => void
  onFieldChange: (field: 'fullName' | 'specialization' | 'note', value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
}

export function CandidateCreatePagePanel({
  formValues,
  onBack,
  onFieldChange,
  onSubmit,
}: CandidateCreatePagePanelProps) {
  const isFormInvalid = !formValues.fullName.trim() || !formValues.specialization.trim()

  return (
    <Card className="rounded-xl border-slate-200 p-4 shadow-none">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900">Добавление кандидата</h3>
        <p className="text-sm text-slate-600">
          Новый кандидат появится в текущем рабочем списке и будет доступен в разделе кандидатов.
        </p>
      </div>

      <Alert className="mt-4">Форма открыта как отдельная страница внутри рабочего пространства.</Alert>

      <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-candidate-full-name">
            ФИО кандидата
          </Label>
          <Input
            id="workspace-candidate-full-name"
            value={formValues.fullName}
            onChange={(event) => onFieldChange('fullName', event.target.value)}
            placeholder="Например, Елена Петрова"
            maxLength={200}
            required
            className="h-11 rounded-xl border-slate-200 text-slate-900"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-candidate-specialization">
            Позиция / специализация
          </Label>
          <Input
            id="workspace-candidate-specialization"
            value={formValues.specialization}
            onChange={(event) => onFieldChange('specialization', event.target.value)}
            placeholder="Senior Frontend Developer"
            maxLength={120}
            required
            className="h-11 rounded-xl border-slate-200 text-slate-900"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-candidate-note">
            Комментарий
          </Label>
          <Textarea
            id="workspace-candidate-note"
            value={formValues.note}
            onChange={(event) => onFieldChange('note', event.target.value)}
            placeholder="Ключевые навыки, ожидания и комментарий по кандидату."
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
            Добавить кандидата
          </Button>
        </div>
      </form>
    </Card>
  )
}
