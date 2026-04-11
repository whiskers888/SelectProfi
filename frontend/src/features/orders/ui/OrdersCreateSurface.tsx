import { type ChangeEvent, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type CreateOrderFormState = {
  title: string
  description: string
}

export type OrdersCreateSurfaceProps = {
  canCreateOrder: boolean
  isCreatingOrder: boolean
  createForm: CreateOrderFormState
  onCreateOrder: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  onCreateInputChange: (
    field: keyof CreateOrderFormState,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
}

export function OrdersCreateSurface({
  canCreateOrder,
  isCreatingOrder,
  createForm,
  onCreateOrder,
  onCreateInputChange,
}: OrdersCreateSurfaceProps) {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Создать заказ</CardTitle>
      </CardHeader>
      <CardContent>
        {!canCreateOrder ? <Alert>Создавать заказ может только роль заказчика.</Alert> : null}
        <form onSubmit={onCreateOrder} className="grid gap-3 md:grid-cols-3">
          <Input
            value={createForm.title}
            onChange={(event) => onCreateInputChange('title', event)}
            placeholder="Название заказа"
            required
            maxLength={200}
            disabled={!canCreateOrder || isCreatingOrder}
          />
          <Textarea
            value={createForm.description}
            onChange={(event) => onCreateInputChange('description', event)}
            placeholder="Описание заказа"
            required
            maxLength={4000}
            className="min-h-10 md:col-span-2"
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
