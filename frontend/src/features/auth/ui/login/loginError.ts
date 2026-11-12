import { extractProblemCode, extractProblemMessage } from '@/features/auth/lib/errors'
import type { LoginFieldErrors } from './loginTypes'

type ResolvedLoginError = {
  title: string
  fieldErrors: LoginFieldErrors
}

const fallbackMessage = 'Не удалось выполнить вход. Повторите попытку.'

export function resolveLoginError(status: number | undefined, data: unknown): ResolvedLoginError {
  const code = extractProblemCode(data)

  if (code === 'invalid_credentials') {
    return {
      title: 'Неверный email или пароль.',
      fieldErrors: {
        email: 'Проверьте введённые данные',
        phone: 'Проверьте введённые данные',
      },
    }
  }

  if (code === 'auth_identifier_required') {
    return { title: 'Укажите email или телефон.', fieldErrors: {} }
  }

  if (status === 401) {
    return { title: 'Неверный email или пароль.', fieldErrors: {} }
  }

  return { title: extractProblemMessage(data, fallbackMessage), fieldErrors: {} }
}
