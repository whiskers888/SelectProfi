import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterPage } from '@/pages/RegisterPage'
import { authSessionReducer } from '@/app/authSessionSlice'
import { api } from '@/shared/api/generated/openapi'

function createStore() {
  return configureStore({
    reducer: {
      authSession: authSessionReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  })
}

function renderRegisterPage() {
  return render(
    <Provider store={createStore()}>
      <MemoryRouter initialEntries={['/auth/join']}>
        <Routes>
          <Route path="/auth/join" element={<RegisterPage />} />
          <Route path="/app" element={<div>workspace</div>} />
          <Route path="/auth" element={<div>login</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

function createJsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function readRequestUrl(input: unknown): string {
  return input instanceof Request ? input.url : typeof input === 'string' ? input : ''
}

async function readRequestBody(input: unknown, init: unknown): Promise<string> {
  if (input instanceof Request) {
    return input.clone().text()
  }

  if (typeof init === 'object' && init !== null && 'body' in init) {
    const body = (init as { body?: unknown }).body
    return typeof body === 'string' ? body : ''
  }

  return ''
}

function createChallengeResponse() {
  return {
    challengeId: '11111111-1111-1111-1111-111111111111',
    channel: 'Phone',
    maskedTarget: '+7 (926) •••-38-10',
    codeLength: 6,
    expiresAtUtc: new Date(Date.now() + 300000).toISOString(),
    resendAvailableAtUtc: new Date(Date.now() + 60000).toISOString(),
    debugCode: '123456',
    developmentMode: true,
  }
}

beforeEach(() => {
  window.scrollTo = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

describe('RegisterPage', () => {
  it('shows the three role cards and advances to the identity step', () => {
    renderRegisterPage()

    expect(screen.getByText('Заказчик')).toBeInTheDocument()
    expect(screen.getByText('Юрлицо и ИП')).toBeInTheDocument()
    expect(screen.getByText('Исполнитель')).toBeInTheDocument()
    expect(screen.getByText('Соискатель')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Продолжить/ }))

    expect(screen.getByRole('heading', { name: 'Создайте аккаунт' })).toBeInTheDocument()
  })

  it('shows validation errors on empty identity submit without calling the API', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderRegisterPage()

    fireEvent.click(screen.getByRole('button', { name: /Продолжить/ }))
    fireEvent.click(screen.getByRole('button', { name: /Получить SMS-код подтверждения/ }))

    expect(screen.getByText('Телефон обязателен')).toBeInTheDocument()
    expect(screen.getByText('Пароль обязателен')).toBeInTheDocument()
    expect(
      screen.getByText('Примите условия оферты и обработку данных'),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('requests a phone verification code and shows the confirmation step', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(createChallengeResponse()))
    vi.stubGlobal('fetch', fetchMock)

    renderRegisterPage()

    fireEvent.click(screen.getByRole('button', { name: /Продолжить/ }))

    fireEvent.change(screen.getByLabelText(/Номер телефона/), {
      target: { value: '9264923810' },
    })
    fireEvent.change(screen.getByLabelText(/Пароль для входа/), {
      target: { value: 'Passw0rd!' },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: /Я принимаю условия/ }))
    fireEvent.click(screen.getByRole('button', { name: /Получить SMS-код подтверждения/ }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    const request = fetchMock.mock.calls[0][0]
    const init = fetchMock.mock.calls[0][1]
    expect(readRequestUrl(request)).toContain('/api/auth/verification/send')
    expect(JSON.parse(await readRequestBody(request, init))).toEqual({
      channel: 'Phone',
      target: '+79264923810',
    })

    expect(
      await screen.findByRole('heading', { name: 'Подтверждение номера' }, { timeout: 2000 }),
    ).toBeInTheDocument()
    expect(screen.getByText('Демо-режим (development)')).toBeInTheDocument()
    expect(screen.getByText(/введите код 123456/i)).toBeInTheDocument()
  })

  it('returns to the profile step after changing the role when the identity is already verified', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse(createChallengeResponse()))
      .mockResolvedValueOnce(
        createJsonResponse({
          verificationToken: 'token-123',
          channel: 'Phone',
          target: '+79264923810',
          verifiedAtUtc: new Date().toISOString(),
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    renderRegisterPage()

    fireEvent.click(screen.getByRole('button', { name: /Продолжить/ }))
    fireEvent.change(screen.getByLabelText(/Номер телефона/), {
      target: { value: '9264923810' },
    })
    fireEvent.change(screen.getByLabelText(/Пароль для входа/), {
      target: { value: 'Passw0rd!' },
    })
    fireEvent.click(screen.getByRole('checkbox', { name: /Я принимаю условия/ }))
    fireEvent.click(screen.getByRole('button', { name: /Получить SMS-код подтверждения/ }))

    await screen.findByRole('heading', { name: 'Подтверждение номера' }, { timeout: 2000 })

    const digits = screen.getAllByLabelText(/Цифра/)
    fireEvent.change(digits[0], { target: { value: '123456' } })

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    await screen.findByRole('heading', { name: 'Расскажите о вашей компании' }, { timeout: 2000 })

    fireEvent.click(screen.getByRole('button', { name: /Сменить/ }))

    expect(screen.getByRole('heading', { name: 'Как вы планируете работать?' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Продолжить/ }))

    expect(
      screen.getByRole('heading', { name: 'Расскажите о вашей компании' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Создайте аккаунт' })).not.toBeInTheDocument()
  })
})
