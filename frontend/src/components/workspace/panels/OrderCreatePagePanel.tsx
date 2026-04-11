import { type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type OrderCreatePagePanelProps = {
  formValues: {
    title: string
    organization: string
    note: string
  }
  isCreatingOrder: boolean
  onBack: () => void
  onFieldChange: (field: 'title' | 'organization' | 'note', value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
}

export function OrderCreatePagePanel({
  formValues,
  isCreatingOrder,
  onBack,
  onFieldChange,
  onSubmit,
}: OrderCreatePagePanelProps) {
  const isFormInvalid = !formValues.title.trim() || !formValues.organization.trim()

  return (
    <Card className="rounded-xl border-slate-200 p-4 shadow-none">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900">Создание заказа</h3>
        <p className="text-sm text-slate-600">
          Новый заказ создается сразу в API и становится доступным в списке.
        </p>
      </div>

      <Alert className="mt-4">После сохранения заказ автоматически откроется в общем списке.</Alert>

      <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-order-title">
            Название заказа
          </Label>
          <Input
            id="workspace-order-title"
            value={formValues.title}
            onChange={(event) => onFieldChange('title', event.target.value)}
            placeholder="Например, Senior React Developer"
            maxLength={200}
            required
            className="h-11 rounded-xl border-slate-200 text-slate-900"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-order-organization">
            Компания / отдел
          </Label>
          <Input
            id="workspace-order-organization"
            value={formValues.organization}
            onChange={(event) => onFieldChange('organization', event.target.value)}
            placeholder="ООО Альфа, digital-направление"
            required
            className="h-11 rounded-xl border-slate-200 text-slate-900"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-order-note">
            Комментарий
          </Label>
          <Textarea
            id="workspace-order-note"
            value={formValues.note}
            onChange={(event) => onFieldChange('note', event.target.value)}
            placeholder="Ключевые детали, сроки и пожелания по вакансии."
            maxLength={3800}
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
            disabled={isCreatingOrder || isFormInvalid}
          >
            {isCreatingOrder ? 'Сохраняем...' : 'Создать заказ'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
