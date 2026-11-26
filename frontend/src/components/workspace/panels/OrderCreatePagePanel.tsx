import { type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type {
  OrderCreateFormField,
  OrderCreateFormValues,
} from '../model/orderCreateForm'

type OrderCreatePagePanelProps = {
  formValues: OrderCreateFormValues
  specializationOptions: { id: string; name: string }[]
  isSpecializationsLoading: boolean
  isCreatingOrder: boolean
  onBack: () => void
  onFieldChange: (
    field: OrderCreateFormField,
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
  const isOptionalAmountValid = (value: string) => {
    if (!value.trim()) return true
    const amount = Number(value)
    return Number.isFinite(amount) && amount >= 0
  }
  const isOptionalPositiveIntegerValid = (value: string) => {
    if (!value.trim()) return true
    const number = Number(value)
    return Number.isInteger(number) && number > 0
  }
  const isOptionalNonnegativeIntegerValid = (value: string) => {
    if (!value.trim()) return true
    const number = Number(value)
    return Number.isInteger(number) && number >= 0
  }
  const parsedSalaryMin = formValues.salaryMin.trim() ? Number(formValues.salaryMin) : null
  const parsedSalaryMax = formValues.salaryMax.trim() ? Number(formValues.salaryMax) : null
  const hasDictionaryOptions = specializationOptions.length > 0
  const isFormInvalid =
    !formValues.title.trim() ||
    !formValues.organization.trim() ||
    !(hasDictionaryOptions ? formValues.specializationId.trim() : formValues.specialization.trim()) ||
    !Number.isFinite(parsedPrice) ||
    parsedPrice <= 0 ||
    !Number.isFinite(parsedRequestedCandidatesCount) ||
    parsedRequestedCandidatesCount < 1 ||
    !isOptionalAmountValid(formValues.salaryMin) ||
    !isOptionalAmountValid(formValues.salaryMax) ||
    !isOptionalPositiveIntegerValid(formValues.fulfillmentDays) ||
    !isOptionalNonnegativeIntegerValid(formValues.warrantyMonths) ||
    !isOptionalAmountValid(formValues.guaranteeReward) ||
    (parsedSalaryMin !== null && parsedSalaryMax !== null && parsedSalaryMin > parsedSalaryMax)

  return (
    <Card className="rounded-xl border-border p-4 shadow-none">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Создание заказа</h3>
        {/* <p className="text-sm text-muted-foreground">Новый заказ создается сразу в API и появляется в общем списке.</p> */}
      </div>

      <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="workspace-order-title">
            Вакансия
          </Label>
          <Input
            id="workspace-order-title"
            value={formValues.title}
            onChange={(event) => onFieldChange('title', event.target.value)}
            placeholder="Например, Senior React Developer"
            maxLength={200}
            required
            className="h-11 rounded-xl border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="workspace-order-organization">
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
            className="h-11 select-none rounded-xl border-border caret-transparent text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="workspace-order-specialization">
            Специализация
          </Label>
          {hasDictionaryOptions ? (
            <select
              id="workspace-order-specialization"
              value={formValues.specializationId}
              onChange={(event) => onFieldChange('specializationId', event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground"
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
              className="h-11 rounded-xl border-border text-foreground"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="workspace-order-price">
            Стоимость заказа
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
            className="h-11 rounded-xl border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="workspace-order-location">
            Локация
          </Label>
          <Input
            id="workspace-order-location"
            value={formValues.location}
            onChange={(event) => onFieldChange('location', event.target.value)}
            placeholder="Например, Москва / удалённо"
            maxLength={255}
            className="h-11 rounded-xl border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="workspace-order-employee-compensation">
            Оплата сотрудника
          </Label>
          <Input
            id="workspace-order-employee-compensation"
            value={formValues.employeeCompensation}
            onChange={(event) => onFieldChange('employeeCompensation', event.target.value)}
            placeholder="Например, 200 000–250 000 ₽ net"
            maxLength={255}
            className="h-11 rounded-xl border-border text-foreground"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground" htmlFor="workspace-order-work-mode">Формат работы</Label>
            <select
              id="workspace-order-work-mode"
              value={formValues.workMode}
              onChange={(event) => onFieldChange('workMode', event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground"
            >
              <option value="">Не указан</option>
              <option value="Remote">Удалённо</option>
              <option value="Office">В офисе</option>
              <option value="Hybrid">Гибридный</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground" htmlFor="workspace-order-fulfillment-days">Срок подбора, дней</Label>
            <Input
              id="workspace-order-fulfillment-days"
              type="number"
              min={1}
              step={1}
              value={formValues.fulfillmentDays}
              onChange={(event) => onFieldChange('fulfillmentDays', event.target.value)}
              placeholder="Например, 20"
              className="h-11 rounded-xl border-border text-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Зарплата кандидата, ₽ в месяц</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground" htmlFor="workspace-order-salary-min">От</Label>
              <Input
                id="workspace-order-salary-min"
                type="number"
                min={0}
                step={1000}
                value={formValues.salaryMin}
                onChange={(event) => onFieldChange('salaryMin', event.target.value)}
                placeholder="Не указана"
                className="h-11 rounded-xl border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground" htmlFor="workspace-order-salary-max">До</Label>
              <Input
                id="workspace-order-salary-max"
                type="number"
                min={0}
                step={1000}
                value={formValues.salaryMax}
                onChange={(event) => onFieldChange('salaryMax', event.target.value)}
                placeholder="Не указана"
                className="h-11 rounded-xl border-border text-foreground"
              />
            </div>
          </div>
          {parsedSalaryMin !== null && parsedSalaryMax !== null && parsedSalaryMin > parsedSalaryMax ? (
            <p className="text-xs text-destructive" role="alert">Минимальная зарплата не может быть выше максимальной.</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground" htmlFor="workspace-order-warranty-months">Гарантийный срок, месяцев</Label>
            <Input
              id="workspace-order-warranty-months"
              type="number"
              min={0}
              step={1}
              value={formValues.warrantyMonths}
              onChange={(event) => onFieldChange('warrantyMonths', event.target.value)}
              placeholder="Например, 3"
              className="h-11 rounded-xl border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground" htmlFor="workspace-order-guarantee-reward">Вознаграждение за гарантию, ₽</Label>
            <Input
              id="workspace-order-guarantee-reward"
              type="number"
              min={0}
              step={1000}
              value={formValues.guaranteeReward}
              onChange={(event) => onFieldChange('guaranteeReward', event.target.value)}
              placeholder="Не указано"
              className="h-11 rounded-xl border-border text-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="workspace-order-functional">
            Функционал
          </Label>
          <Textarea
            id="workspace-order-functional"
            value={formValues.functional}
            onChange={(event) => onFieldChange('functional', event.target.value)}
            placeholder="Основные задачи будущего сотрудника"
            maxLength={4000}
            className="min-h-28 rounded-xl border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="workspace-order-requirements">
            Требования
          </Label>
          <Textarea
            id="workspace-order-requirements"
            value={formValues.requirements}
            onChange={(event) => onFieldChange('requirements', event.target.value)}
            placeholder="Опыт, навыки и обязательные требования"
            maxLength={4000}
            className="min-h-28 rounded-xl border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="workspace-order-other-conditions">
            Другие условия
          </Label>
          <Textarea
            id="workspace-order-other-conditions"
            value={formValues.otherConditions}
            onChange={(event) => onFieldChange('otherConditions', event.target.value)}
            placeholder="ДМС, техника, бонусы и другие преимущества"
            maxLength={4000}
            className="min-h-28 rounded-xl border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="workspace-order-requested-candidates-count">
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
            className="h-11 rounded-xl border-border text-foreground"
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            className="h-10 rounded-xl border-border text-muted-foreground"
            onClick={onBack}
            type="button"
            variant="outline"
          >
            Назад
          </Button>
          <Button
            className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
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
