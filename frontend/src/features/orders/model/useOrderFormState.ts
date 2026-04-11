import type { ChangeEvent, Dispatch, SetStateAction } from 'react'

type OrderEditState = {
  title: string
  description: string
}

type UseOrderFormStateArgs = {
  setSelectedExecutorIdsByOrder: Dispatch<SetStateAction<Record<string, string>>>
  setCreateForm: Dispatch<SetStateAction<OrderEditState>>
  setOrderEditsById: Dispatch<SetStateAction<Record<string, OrderEditState>>>
}

export function useOrderFormState({
  setSelectedExecutorIdsByOrder,
  setCreateForm,
  setOrderEditsById,
}: UseOrderFormStateArgs) {
  // @dvnull: Ранее handlers изменения формы/таблицы были локально в OrdersPage; вынесены в model-хук без изменения сценариев обновления state.
  function handleExecutorSelectChange(orderId: string, event: ChangeEvent<HTMLSelectElement>) {
    const nextValue = event.target.value
    setSelectedExecutorIdsByOrder((previous) => ({
      ...previous,
      [orderId]: nextValue,
    }))
  }

  // @dvnull: Ранее create-форма принимала только Input-события; расширено до Textarea для description без изменения структуры state.
  function handleCreateInputChange(
    field: 'title' | 'description',
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const nextValue = event.target.value
    setCreateForm((previous) => ({
      ...previous,
      [field]: nextValue,
    }))
  }

  function handleOrderEditInputChange(
    orderId: string,
    field: 'title' | 'description',
    event: ChangeEvent<HTMLInputElement>,
    currentTitle: string,
    currentDescription: string,
  ) {
    const nextValue = event.target.value
    setOrderEditsById((previous) => {
      const current = previous[orderId] ?? {
        title: currentTitle,
        description: currentDescription,
      }

      return {
        ...previous,
        [orderId]: {
          ...current,
          [field]: nextValue,
        },
      }
    })
  }

  return {
    handleExecutorSelectChange,
    handleCreateInputChange,
    handleOrderEditInputChange,
  }
}
