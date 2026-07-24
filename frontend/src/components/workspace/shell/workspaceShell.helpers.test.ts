import { describe, expect, it } from 'vitest'
import type { OrderResponse } from '@/shared/api/orders'
import { toWorkspaceOrder } from './workspaceShell.helpers'

describe('toWorkspaceOrder', () => {
  it('maps structured vacancy details without confusing company or salary with legacy fields', () => {
    const response: OrderResponse = {
      id: 'order-1',
      customerId: 'customer-1',
      executorId: null,
      title: 'Senior React Developer',
      description: 'Legacy description that is not a company',
      location: 'Москва / удалённо',
      employeeCompensation: '200 000–250 000 ₽ net',
      functional: 'Разработка продукта',
      requirements: 'React и TypeScript',
      otherConditions: 'ДМС и техника',
      specialization: 'Frontend',
      specializationId: 'specialization-1',
      price: 500000,
      grossAmount: 500000,
      serviceCommissionPercent: 15,
      serviceCommissionAmount: 75000,
      executorNetAmount: 425000,
      isPricingLocked: false,
      customerCompanyName: 'ООО Альфа',
      requestedCandidatesCount: 3,
      status: 'Active',
      createdAtUtc: '2026-07-23T10:00:00Z',
      updatedAtUtc: '2026-07-23T11:00:00Z',
      deletedAtUtc: null,
    }

    const order = toWorkspaceOrder(response)

    expect(order.company).toBe('ООО Альфа')
    expect(order.company).not.toBe(response.description)
    expect(order.employeeCompensation).toBe(response.employeeCompensation)
    expect(order.employeeCompensation).not.toBe(String(response.price))
    expect(order.location).toBe(response.location)
    expect(order.functional).toBe(response.functional)
    expect(order.requirements).toBe(response.requirements)
    expect(order.otherConditions).toBe(response.otherConditions)
    expect(order.grossAmount).toBe(500000)
    expect(order.executorNetAmount).toBe(425000)
  })

  it('maps an assigned active order to the working status', () => {
    const response: OrderResponse = {
      id: 'order-2',
      customerId: 'customer-1',
      executorId: 'executor-1',
      title: 'Backend Developer',
      description: 'Description',
      location: 'Удалённо',
      employeeCompensation: '250 000 ₽',
      functional: 'Разработка',
      requirements: 'Опыт',
      otherConditions: 'ДМС',
      specialization: 'Backend',
      price: 100000,
      grossAmount: 100000,
      serviceCommissionPercent: 15,
      serviceCommissionAmount: 15000,
      executorNetAmount: 85000,
      isPricingLocked: true,
      customerCompanyName: 'ООО Альфа',
      requestedCandidatesCount: 3,
      status: 'Active',
      createdAtUtc: '2026-07-23T10:00:00Z',
      updatedAtUtc: '2026-07-23T11:00:00Z',
      deletedAtUtc: null,
    }

    expect(toWorkspaceOrder(response).statusLabel).toBe('В работе')
  })
})
