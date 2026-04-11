import { type ChangeEvent, type FormEvent, useState } from 'react'
import { parseNonNegativeInteger } from '@/features/orders/lib/pagination'
import type { GetOrdersRequest } from '@/shared/api/orders'

type UseOrdersQueryStateArgs = {
  defaultLimit: number
  defaultOffset: number
  onApplyQuery?: () => void
  onValidationError: (message: string) => void
}

type PreviousPageArgs = {
  currentOrdersLimit: number
  currentOrdersOffset: number
}

type NextPageArgs = {
  currentOrdersLimit: number
  currentOrdersOffset: number
  itemsLength: number
}

export function useOrdersQueryState({
  defaultLimit,
  defaultOffset,
  onApplyQuery,
  onValidationError,
}: UseOrdersQueryStateArgs) {
  const [ordersQuery, setOrdersQuery] = useState<GetOrdersRequest>({
    limit: defaultLimit,
    offset: defaultOffset,
  })
  const [ordersLimitInput, setOrdersLimitInput] = useState(String(defaultLimit))
  const [ordersOffsetInput, setOrdersOffsetInput] = useState(String(defaultOffset))

  function applyOrdersQuery(limit: number, offset: number) {
    setOrdersQuery({ limit, offset })
    setOrdersLimitInput(String(limit))
    setOrdersOffsetInput(String(offset))
    onApplyQuery?.()
  }

  function handleOrdersQueryInputChange(field: 'limit' | 'offset', event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value
    if (field === 'limit') {
      setOrdersLimitInput(nextValue)
      return
    }

    setOrdersOffsetInput(nextValue)
  }

  function handleApplyOrdersQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedLimit = parseNonNegativeInteger(ordersLimitInput)
    const parsedOffset = parseNonNegativeInteger(ordersOffsetInput)

    if (parsedLimit === null || parsedLimit <= 0) {
      onValidationError('limit должен быть целым числом больше 0.')
      return
    }

    if (parsedOffset === null) {
      onValidationError('offset должен быть целым числом от 0.')
      return
    }

    applyOrdersQuery(parsedLimit, parsedOffset)
  }

  function handlePreviousOrdersPage({
    currentOrdersLimit,
    currentOrdersOffset,
  }: PreviousPageArgs) {
    if (currentOrdersOffset <= 0) {
      return
    }

    const nextOffset = Math.max(0, currentOrdersOffset - currentOrdersLimit)
    applyOrdersQuery(currentOrdersLimit, nextOffset)
  }

  function handleNextOrdersPage({
    currentOrdersLimit,
    currentOrdersOffset,
    itemsLength,
  }: NextPageArgs) {
    if (itemsLength < currentOrdersLimit) {
      return
    }

    const nextOffset = currentOrdersOffset + currentOrdersLimit
    applyOrdersQuery(currentOrdersLimit, nextOffset)
  }

  return {
    ordersQuery,
    ordersLimitInput,
    ordersOffsetInput,
    applyOrdersQuery,
    handleOrdersQueryInputChange,
    handleApplyOrdersQuery,
    handlePreviousOrdersPage,
    handleNextOrdersPage,
  }
}
