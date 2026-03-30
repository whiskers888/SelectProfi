import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthPage } from './AuthPage'
import { api } from '../shared/api/generated/openapi'
import { authSessionReducer } from '../app/authSessionSlice'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

function renderAuthPage() {
  const store = configureStore({
    reducer: {
      authSession: authSessionReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  })

  return render(
    <Provider store={store}>
      <AuthPage />
    </Provider>,
  )
}

function readRequestUrl(input: unknown): string {
  if (input instanceof Request) {
    return input.url
  }

  return typeof input === 'string' ? input : ''
}

describe('AuthPage', () => {
  it('renders registration form with allowed public roles', async () => {
    renderAuthPage()

    expect(screen.getByRole('heading', { name: 'Регистрация' })).toBeInTheDocument()
    expect(screen.getByLabelText('Имя')).toBeInTheDocument()
    expect(screen.getByLabelText('Фамилия')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Телефон')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()

    const roleTrigger = screen.getByLabelText('Роль')
    expect(roleTrigger).toBeInTheDocument()

    roleTrigger.focus()
    fireEvent.keyDown(roleTrigger, { key: 'ArrowDown' })

    expect(await screen.findByRole('option', { name: 'Соискатель' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Заказчик' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Исполнитель' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /admin/i })).not.toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', () => {
    renderAuthPage()

    fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(screen.getByText('Имя обязательно')).toBeInTheDocument()
    expect(screen.getByText('Фамилия обязательна')).toBeInTheDocument()
    expect(screen.getByText('Email обязателен')).toBeInTheDocument()
    expect(screen.getByText('Пароль обязателен')).toBeInTheDocument()
  })

  it('validates email format', () => {
    renderAuthPage()

    fireEvent.change(screen.getByLabelText('Имя'), { target: { value: 'Иван' } })
    fireEvent.change(screen.getByLabelText('Фамилия'), { target: { value: 'Иванов' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid-email' } })
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'StrongPass123' } })

    fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(screen.getByText('Введите корректный email')).toBeInTheDocument()
  })

  it('switches to login mode and validates required fields', () => {
    renderAuthPage()

    fireEvent.click(screen.getByRole('tab', { name: 'Вход' }))

    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByText('Email обязателен')).toBeInTheDocument()
    expect(screen.getByText('Пароль обязателен')).toBeInTheDocument()
  })

  it('stores auth session after successful login', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: 'login-access-token',
          refreshToken: 'login-refresh-token',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderAuthPage()

    fireEvent.click(screen.getByRole('tab', { name: 'Вход' }))
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'StrongPass123!' } })
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Вход выполнен успешно.')
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(readRequestUrl(fetchMock.mock.calls[0][0])).toContain('/api/auth/login')
    expect(window.localStorage.getItem('selectprofi.auth.session')).toBe(
      JSON.stringify({
        accessToken: 'login-access-token',
        refreshToken: 'login-refresh-token',
      }),
    )
  })
})
