import { type ChangeEvent, type FormEvent, useState } from 'react'
import { parseNonNegativeInteger } from '@/features/vacancies/lib/pagination'
import type { GetVacanciesRequest } from '@/shared/api/vacancies'

type UseVacanciesQueryStateArgs = {
  defaultLimit: number
  defaultOffset: number
  onApplyQuery?: () => void
  onValidationError: (message: string) => void
}

type PreviousPageArgs = {
  currentVacanciesLimit: number
  currentVacanciesOffset: number
}

type NextPageArgs = {
  currentVacanciesLimit: number
  currentVacanciesOffset: number
  vacanciesLength: number
}

export function useVacanciesQueryState({
  defaultLimit,
  defaultOffset,
  onApplyQuery,
  onValidationError,
}: UseVacanciesQueryStateArgs) {
  const [vacanciesQuery, setVacanciesQuery] = useState<GetVacanciesRequest>({
    limit: defaultLimit,
    offset: defaultOffset,
  })
  const [vacanciesLimitInput, setVacanciesLimitInput] = useState(String(defaultLimit))
  const [vacanciesOffsetInput, setVacanciesOffsetInput] = useState(String(defaultOffset))

  function applyVacanciesQuery(limit: number, offset: number) {
    setVacanciesQuery({ limit, offset })
    setVacanciesLimitInput(String(limit))
    setVacanciesOffsetInput(String(offset))
    onApplyQuery?.()
  }

  function handleVacanciesQueryInputChange(field: 'limit' | 'offset', event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value
    if (field === 'limit') {
      setVacanciesLimitInput(nextValue)
      return
    }

    setVacanciesOffsetInput(nextValue)
  }

  function handleApplyVacanciesQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedLimit = parseNonNegativeInteger(vacanciesLimitInput)
    const parsedOffset = parseNonNegativeInteger(vacanciesOffsetInput)

    if (parsedLimit === null || parsedLimit <= 0) {
      onValidationError('limit должен быть целым числом больше 0.')
      return
    }

    if (parsedOffset === null) {
      onValidationError('offset должен быть целым числом от 0.')
      return
    }

    applyVacanciesQuery(parsedLimit, parsedOffset)
  }

  function handlePreviousVacanciesPage({
    currentVacanciesLimit,
    currentVacanciesOffset,
  }: PreviousPageArgs) {
    if (currentVacanciesOffset <= 0) {
      return
    }

    const nextOffset = Math.max(0, currentVacanciesOffset - currentVacanciesLimit)
    applyVacanciesQuery(currentVacanciesLimit, nextOffset)
  }

  function handleNextVacanciesPage({
    currentVacanciesLimit,
    currentVacanciesOffset,
    vacanciesLength,
  }: NextPageArgs) {
    if (vacanciesLength < currentVacanciesLimit) {
      return
    }

    const nextOffset = currentVacanciesOffset + currentVacanciesLimit
    applyVacanciesQuery(currentVacanciesLimit, nextOffset)
  }

  return {
    vacanciesQuery,
    vacanciesLimitInput,
    vacanciesOffsetInput,
    applyVacanciesQuery,
    handleVacanciesQueryInputChange,
    handleApplyVacanciesQuery,
    handlePreviousVacanciesPage,
    handleNextVacanciesPage,
  }
}
