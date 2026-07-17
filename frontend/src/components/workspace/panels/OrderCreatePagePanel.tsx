import { type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TiptapTextEditor } from '@/components/ui/tiptap-text-editor'

type OrderCreatePagePanelProps = {
  formValues: {
    title: string
    organization: string
    specialization: string
    specializationId: string
    price: string
    note: string
    requestedCandidatesCount: string
  }
  specializationOptions: { id: string; name: string }[]
  isSpecializationsLoading: boolean
  isCreatingOrder: boolean
  onBack: () => void
  onFieldChange: (
    field: 'title' | 'organization' | 'specialization' | 'specializationId' | 'price' | 'note' | 'requestedCandidatesCount',
    value: string,
  ) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
}

export function OrderCreatePagePanel({
  formValues,
  specializationOptions,
  isSpecializationsLoading,
  isCreatingOrder,
  onBack,
  onFieldChange,
  onSubmit,
}: OrderCreatePagePanelProps) {
  const parsedRequestedCandidatesCount = Number.parseInt(formValues.requestedCandidatesCount.trim(), 10)
  const parsedPrice = Number.parseFloat(formValues.price.trim())
  const hasDictionaryOptions = specializationOptions.length > 0
  const isFormInvalid =
    !formValues.title.trim() ||
    !formValues.organization.trim() ||
    !(hasDictionaryOptions ? formValues.specializationId.trim() : formValues.specialization.trim()) ||
    !Number.isFinite(parsedPrice) ||
    parsedPrice <= 0 ||
    !Number.isFinite(parsedRequestedCandidatesCount) ||
    parsedRequestedCandidatesCount < 1

  return (
    <Card className="rounded-xl border-slate-200 p-4 shadow-none">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900">Создание заказа</h3>
        {/* <p className="text-sm text-slate-600">Новый заказ создается сразу в API и появляется в общем списке.</p> */}
      </div>

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
            Компания
          </Label>
          <Input
            id="workspace-order-organization"
            value={formValues.organization}
            onMouseDown={(event) => event.preventDefault()}
            placeholder="ООО Альфа"
            required
            readOnly
            tabIndex={-1}
            className="h-11 select-none rounded-xl border-slate-200 caret-transparent text-slate-900"
          />
        </div>

        <div className="space-y-2">
          {/* @dvnull: Ранее форма заказа содержала только company/comment/count; добавлены отдельные поля specialization и price для явного ввода параметров заказа. */}
          <Label className="text-slate-600" htmlFor="workspace-order-specialization">
            Специализация
          </Label>
          {hasDictionaryOptions ? (
            <select
              id="workspace-order-specialization"
              value={formValues.specializationId}
              onChange={(event) => onFieldChange('specializationId', event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              required
              disabled={isSpecializationsLoading}
            >
              <option value="" disabled>
                {isSpecializationsLoading ? 'Загрузка специализаций...' : 'Выберите специализацию'}
              </option>
              {specializationOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id="workspace-order-specialization"
              value={formValues.specialization}
              onChange={(event) => onFieldChange('specialization', event.target.value)}
              placeholder="Например, Frontend (React)"
              maxLength={120}
              required
              className="h-11 rounded-xl border-slate-200 text-slate-900"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-order-price">
            Цена заказа
          </Label>
          <Input
            id="workspace-order-price"
            type="number"
            min={1}
            step={1000}
            value={formValues.price}
            onChange={(event) => onFieldChange('price', event.target.value)}
            placeholder="Например, 250000"
            required
            className="h-11 rounded-xl border-slate-200 text-slate-900"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-order-note">
            Комментарий
          </Label>
          {/* @dvnull: Ранее для комментария использовался Textarea с plain-text вводом; заменено на tiptap для пилотной rich-text формы создания заказа. */}
          <TiptapTextEditor
            value={formValues.note}
            onChange={(value) => onFieldChange('note', value.slice(0, 3800))}
            placeholder="Ключевые детали, сроки и пожелания по вакансии."
            className="rounded-xl border-slate-200 text-slate-900"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600" htmlFor="workspace-order-requested-candidates-count">
            Требуемое количество кандидатов
          </Label>
          <Input
            id="workspace-order-requested-candidates-count"
            type="number"
            min={1}
            step={1}
            value={formValues.requestedCandidatesCount}
            onChange={(event) => onFieldChange('requestedCandidatesCount', event.target.value)}
            placeholder="Минимум 1"
            required
            className="h-11 rounded-xl border-slate-200 text-slate-900"
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
