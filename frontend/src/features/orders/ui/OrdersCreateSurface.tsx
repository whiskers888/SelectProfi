import { type ChangeEvent, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TiptapTextEditor } from '@/components/ui/tiptap-text-editor'

type CreateOrderFormState = {
  title: string
  description: string
  requestedCandidatesCount: string
}

export type OrdersCreateSurfaceProps = {
  canCreateOrder: boolean
  isCreatingOrder: boolean
  customerCompanyName: string
  createForm: CreateOrderFormState
  onCreateOrder: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onCreateInputChange: (
    field: keyof CreateOrderFormState,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  onCreateDescriptionChange: (value: string) => void
}

export function OrdersCreateSurface({
  canCreateOrder,
  isCreatingOrder,
  customerCompanyName,
  createForm,
  onCreateOrder,
  onCreateInputChange,
  onCreateDescriptionChange,
}: OrdersCreateSurfaceProps) {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Создать заказ</CardTitle>
      </CardHeader>
      <CardContent>
        {!canCreateOrder ? <Alert>Создавать заказ может только роль заказчика.</Alert> : null}
        {canCreateOrder && !customerCompanyName.trim() ? (
          <Alert variant="destructive">В профиле заказчика не заполнено название компании.</Alert>
        ) : null}
        <form onSubmit={onCreateOrder} className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="order-customer-company-name">Компания заказчика</Label>
            <Input
              id="order-customer-company-name"
              value={customerCompanyName}
              placeholder="Название компании из профиля"
              readOnly
            />
          </div>
          <Input
            value={createForm.title}
            onChange={(event) => onCreateInputChange('title', event)}
            placeholder="Название заказа"
            required
            maxLength={200}
            disabled={!canCreateOrder || isCreatingOrder}
          />
          {/* @dvnull: Ранее здесь был Textarea для plain-text description; заменено на tiptap-компонент в блоке "Комментарий" для пилотного rich-text UI. */}
          <div className="space-y-2 md:col-span-2">
            <Label>Комментарий</Label>
            <TiptapTextEditor
              value={createForm.description}
              onChange={onCreateDescriptionChange}
              placeholder="Описание заказа"
              disabled={!canCreateOrder || isCreatingOrder}
            />
          </div>
          <Input
            type="number"
            min={1}
            step={1}
            value={createForm.requestedCandidatesCount}
            onChange={(event) => onCreateInputChange('requestedCandidatesCount', event)}
            placeholder="Требуемое количество кандидатов (минимум 1)"
            required
            disabled={!canCreateOrder || isCreatingOrder}
          />
          <div>
            <Button type="submit" disabled={!canCreateOrder || isCreatingOrder}>
              Создать
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
