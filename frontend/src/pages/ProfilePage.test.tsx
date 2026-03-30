import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProfilePage } from './ProfilePage'
import { api } from '../shared/api/generated/openapi'
import { authSessionReducer } from '../app/authSessionSlice'

type ProfileFixture = {
  userId: string
  email: string
  phone?: string | null
  firstName: string
  lastName: string
  role: 'Applicant' | 'Executor' | 'Customer' | 'Admin'
  isEmailVerified: boolean
  isPhoneVerified: boolean
  applicantProfile?: {
    resumeTitle?: string
    previousCompanyName?: string
    workPeriod?: string
    experienceSummary?: string
    achievements?: string
    education?: string
    skills?: string[]
    certificates?: string[]
    portfolioUrl?: string
    about?: string
    desiredSalary?: number
  } | null
  customerProfile?: {
    inn?: string
    egrn?: string
    egrnip?: string
    companyName?: string
    companyLogoUrl?: string
  } | null
  executorProfile?: {
    employmentType?: 'Fl' | 'Smz' | 'Ip'
    projectTitle?: string
    projectCompanyName?: string
    experienceSummary?: string
    achievements?: string
    certificates?: string[]
    grade?: string
    extraInfo?: string
  } | null
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

function createJsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

function readRequestUrl(input: unknown): string {
  if (input instanceof Request) {
    return input.url
  }

  return typeof input === 'string' ? input : ''
}

function readRequestMethod(input: unknown, init: unknown): string {
  if (input instanceof Request) {
    return input.method
  }

  if (typeof init === 'object' && init !== null && 'method' in init) {
    const maybeMethod = (init as { method?: unknown }).method
    return typeof maybeMethod === 'string' ? maybeMethod : 'GET'
  }

  return 'GET'
}

async function readRequestBody(input: unknown, init: unknown): Promise<string> {
  if (input instanceof Request) {
    return input.clone().text()
  }

  if (typeof init === 'object' && init !== null && 'body' in init) {
    const maybeBody = (init as { body?: unknown }).body
    return typeof maybeBody === 'string' ? maybeBody : ''
  }

  return ''
}

function renderProfilePage() {
  const store = configureStore({
    reducer: {
      authSession: authSessionReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  })

  return render(
    <Provider store={store}>
      <ProfilePage />
    </Provider>,
  )
}

function createApplicantProfile(): ProfileFixture {
  return {
    userId: 'c1de92c5-a247-4248-92af-eed1d68d89bb',
    email: 'applicant@example.com',
    phone: '+79991112233',
    firstName: 'Иван',
    lastName: 'Иванов',
    role: 'Applicant',
    isEmailVerified: true,
    isPhoneVerified: false,
    applicantProfile: {
      resumeTitle: 'Frontend Engineer',
      previousCompanyName: 'ООО Ромашка',
      workPeriod: '2021-2025',
      experienceSummary: 'React + TypeScript',
      achievements: 'Запустил новый кабинет',
      education: 'МФТИ',
      skills: ['React', 'TypeScript'],
      certificates: ['AWS'],
      portfolioUrl: 'https://portfolio.example.com',
      about: 'Люблю продуктовую разработку',
      desiredSalary: 250000,
    },
    customerProfile: null,
    executorProfile: null,
  }
}

function createExecutorProfile(): ProfileFixture {
  return {
    userId: '8ce7a140-7fd2-4a56-b0fd-e69f7be7237b',
    email: 'executor@example.com',
    phone: '+79993334455',
    firstName: 'Петр',
    lastName: 'Петров',
    role: 'Executor',
    isEmailVerified: true,
    isPhoneVerified: true,
    applicantProfile: null,
    customerProfile: null,
    executorProfile: {
      employmentType: undefined,
      projectTitle: 'Marketplace',
      projectCompanyName: 'АО Проект',
      experienceSummary: 'Node.js',
      achievements: 'Стабилизировал релиз',
      certificates: ['Kubernetes'],
      grade: 'Senior',
      extraInfo: 'Доступен с мая',
    },
  }
}

describe('ProfilePage', () => {
  it('submits applicant role-specific payload', async () => {
    const initialProfile = createApplicantProfile()
    const updatedProfile: ProfileFixture = {
      ...initialProfile,
      applicantProfile: {
        ...initialProfile.applicantProfile,
        resumeTitle: 'Lead Frontend Engineer',
        skills: ['React', 'TypeScript', 'RTK Query'],
        desiredSalary: 350000,
      },
    }

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse(initialProfile))
      .mockResolvedValueOnce(createJsonResponse(updatedProfile))
      .mockResolvedValueOnce(createJsonResponse(updatedProfile))
    vi.stubGlobal('fetch', fetchMock)

    renderProfilePage()

    await screen.findByRole('heading', { name: 'Профиль соискателя' })

    fireEvent.click(screen.getAllByRole('button', { name: 'Редактировать' })[1])
    fireEvent.change(screen.getByLabelText('Желаемая должность'), { target: { value: 'Lead Frontend Engineer' } })
    fireEvent.change(screen.getByLabelText('Навыки (через запятую)'), {
      target: { value: 'React, TypeScript, RTK Query' },
    })
    fireEvent.change(screen.getByLabelText('Желаемая зарплата'), { target: { value: '350000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Профиль обновлён.')
    })

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(readRequestUrl(fetchMock.mock.calls[1][0])).toContain('/api/profile/me')
    expect(readRequestMethod(fetchMock.mock.calls[1][0], fetchMock.mock.calls[1][1])).toBe('PUT')

    const body = await readRequestBody(fetchMock.mock.calls[1][0], fetchMock.mock.calls[1][1])
    const payload = JSON.parse(body) as {
      applicantProfile?: { resumeTitle?: string; skills?: string[]; desiredSalary?: number }
    }

    expect(payload.applicantProfile?.resumeTitle).toBe('Lead Frontend Engineer')
    expect(payload.applicantProfile?.skills).toEqual(['React', 'TypeScript', 'RTK Query'])
    expect(payload.applicantProfile?.desiredSalary).toBe(350000)
  })

  it('shows validation error and prevents submit for executor without employmentType', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(createJsonResponse(createExecutorProfile()))
    vi.stubGlobal('fetch', fetchMock)

    renderProfilePage()

    await screen.findByRole('heading', { name: 'Профиль исполнителя' })

    fireEvent.click(screen.getAllByRole('button', { name: 'Редактировать' })[1])
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(screen.getByText('Формат занятости обязателен')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
