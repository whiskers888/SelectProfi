import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '@/pages/LoginPage'
import { authSessionReducer } from '@/app/authSessionSlice'
import { runtimeStatusReducer } from '@/app/runtimeStatusSlice'
import { api } from '@/shared/api/generated/openapi'

function createStore() {
  return configureStore({
    reducer: {
      authSession: authSessionReducer,
      runtimeStatus: runtimeStatusReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  })
}

function renderLoginPage() {
  return render(
    <Provider store={createStore()}>
      <MemoryRouter initialEntries={['/auth']}>
        <Routes>
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/app" element={<div>Рабочее пространство</div>} />
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

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

describe('LoginPage', () => {
  it('renders the page title and both identifier tabs', () => {
    renderLoginPage()

    expect(screen.getByRole('heading', { name: 'Вход в платформу' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'По email' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'По телефону' })).toBeInTheDocument()
  })

  it('shows validation errors on empty submit without calling the API', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderLoginPage()

    fireEvent.click(screen.getByRole('button', { name: /Продолжить/ }))

    expect(screen.getByText('Email обязателен')).toBeInTheDocument()
    expect(screen.getByText('Пароль обязателен')).toBeInTheDocument()
    expect(
      screen.getByText('Проверьте поля формы и повторите отправку.'),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('switches to phone mode and shows the phone field', () => {
    renderLoginPage()

    fireEvent.click(screen.getByRole('tab', { name: 'По телефону' }))

    expect(screen.getByLabelText(/Номер телефона/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Рабочий email')).not.toBeInTheDocument()
  })

  it('posts credentials on successful login and navigates to /app', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse({ accessToken: 'access-token', refreshToken: 'refresh-token' }),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Рабочий email'), {
      target: { value: 'name@company.ru' },
    })
    fireEvent.change(screen.getByLabelText(/Пароль/), { target: { value: 'secret-pass' } })
    fireEvent.click(screen.getByRole('button', { name: /Продолжить/ }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    const request = fetchMock.mock.calls[0][0]
    const init = fetchMock.mock.calls[0][1]
    expect(readRequestUrl(request)).toContain('/api/auth/login')
    expect(JSON.parse(await readRequestBody(request, init))).toEqual({
      email: 'name@company.ru',
      password: 'secret-pass',
    })

    expect(await screen.findByText('Рабочее пространство', {}, { timeout: 2000 })).toBeInTheDocument()
  })
})
