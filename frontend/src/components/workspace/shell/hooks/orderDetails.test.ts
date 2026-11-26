import { describe, expect, it } from 'vitest'
import { includeFetchedOrderForDetails } from './orderDetails'
import type { WorkspaceOrder } from '../../model/data'

const order = (id: string): WorkspaceOrder => ({
  id,
  title: `Заказ ${id}`,
  company: 'Компания',
  location: 'Москва',
  employeeCompensation: 'от 100 000 ₽',
  functional: '',
  requirements: '',
  otherConditions: '',
  priority: 'medium',
  responses: 0,
  statusLabel: 'Опубликован',
  statusTone: 'default',
  updatedAt: '',
})

describe('includeFetchedOrderForDetails', () => {
  it('adds a fetched order that was missing from the initial list', () => {
    const listed = [order('listed')]
    const fetched = order('older-order')

    expect(includeFetchedOrderForDetails(listed, 'older-order', fetched)).toEqual([listed[0], fetched])
  })

  it('does not add data belonging to a different order URL', () => {
    const listed = [order('listed')]

    expect(includeFetchedOrderForDetails(listed, 'requested', order('previous-request'))).toBe(listed)
  })

  it('does not duplicate an order already in the list', () => {
    const listed = [order('listed')]

    expect(includeFetchedOrderForDetails(listed, 'listed', order('listed'))).toBe(listed)
  })
})
