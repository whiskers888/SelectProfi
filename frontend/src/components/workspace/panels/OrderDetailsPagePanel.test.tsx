import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { WorkspaceOrder } from '../model/data'
import { OrderDetailsPagePanel } from './OrderDetailsPagePanel'

afterEach(cleanup)

const order: WorkspaceOrder = {
  id: 'order-1',
  customerId: 'customer-1',
  executorId: null,
  price: 500000,
  title: 'Senior React Developer',
  company: 'ООО Альфа',
  location: 'Москва / удалённо',
  employeeCompensation: '200 000–250 000 ₽ net',
  functional: 'Разработка продукта',
  requirements: 'React и TypeScript',
  otherConditions: 'ДМС и техника',
  priority: 'high',
  responses: 0,
  statusLabel: 'Активен',
  statusTone: 'success',
  updatedAt: 'Обновлено сегодня',
}

describe('OrderDetailsPagePanel', () => {
  it('renders the seven vacancy fields in the requested order', () => {
    const { container } = render(<OrderDetailsPagePanel order={order} onBack={() => {}} />)
    const labels = Array.from(container.querySelectorAll('dt'))
      .slice(0, 7)
      .map((element) => element.textContent?.trim())

    expect(labels).toEqual([
      'Компания',
      'Вакансия',
      'Локация',
      'Оплата',
      'Функционал',
      'Требования',
      'Другие условия',
    ])
  })

  it('shows an honest unavailable state for empty legacy fields', () => {
    const { getAllByText } = render(
      <OrderDetailsPagePanel
        order={{
          ...order,
          location: '',
          employeeCompensation: '',
          functional: '',
          requirements: '',
          otherConditions: '',
        }}
        onBack={() => {}}
      />,
    )

    expect(getAllByText('Не указано')).toHaveLength(5)
  })
})
