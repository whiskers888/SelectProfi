import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { clearAuthSession, setAuthSession, type AuthSession } from '../../../app/authSessionSlice'
import { apiMode } from '../../config/apiMode'

const baseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.MODE === 'test' ? 'http://localhost:5268' : '/')

const parsedMockLatency = Number(import.meta.env.VITE_MOCK_API_LATENCY ?? 160)
const mockLatencyMs =
  Number.isFinite(parsedMockLatency) && parsedMockLatency >= 0 ? parsedMockLatency : 160

type AuthSessionStateSnapshot = {
  authSession?: {
    session?: AuthSession | null
  }
}

type MockUserRole = 'Applicant' | 'Executor' | 'Customer' | 'Admin'

type MockApplicantProfile = {
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
}

type MockCustomerProfile = {
  inn?: string
  egrn?: string
  egrnip?: string
  companyName?: string
  companyLogoUrl?: string
}

type MockExecutorProfile = {
  employmentType?: 'Fl' | 'Smz' | 'Ip'
  projectTitle?: string
  projectCompanyName?: string
  experienceSummary?: string
  achievements?: string
  certificates?: string[]
  grade?: string
  extraInfo?: string
}

type MockUser = {
  email: string
  password: string
  firstName: string
  lastName: string
  role: MockUserRole
  phone?: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  applicantProfile?: MockApplicantProfile | null
  customerProfile?: MockCustomerProfile | null
  executorProfile?: MockExecutorProfile | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.accessToken === 'string' && typeof value.refreshToken === 'string'
}

function readAuthSessionFromState(state: unknown): AuthSession | null {
  if (!isRecord(state)) {
    return null
  }

  const maybeState = state as AuthSessionStateSnapshot
  return maybeState.authSession?.session ?? null
}

function resolveRequestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url
}

function resolveRequestMethod(args: string | FetchArgs): string {
  if (typeof args === 'string') {
    return 'GET'
  }

  return (args.method ?? 'GET').toUpperCase()
}

function resolveRequestBody(args: string | FetchArgs): unknown {
  if (typeof args === 'string') {
    return undefined
  }

  return args.body
}

function isUnauthorized(error: FetchBaseQueryError | undefined): boolean {
  return error?.status === 401
}

function isRefreshRequest(args: string | FetchArgs): boolean {
  return resolveRequestUrl(args).includes('/api/auth/refresh')
}

function getStringField(body: unknown, field: string): string {
  if (!isRecord(body)) {
    return ''
  }

  const value = body[field]
  return typeof value === 'string' ? value.trim() : ''
}

function createMockToken(prefix: 'access' | 'refresh', email: string): string {
  return `mock-${prefix}:${encodeURIComponent(email)}:${Date.now()}`
}

function readEmailFromMockToken(
  token: string | undefined,
  expectedPrefix: 'access' | 'refresh',
): string | null {
  if (!token) {
    return null
  }

  const [tokenPrefix, encodedEmail] = token.split(':')
  if (tokenPrefix !== `mock-${expectedPrefix}` || !encodedEmail) {
    return null
  }

  try {
    const email = decodeURIComponent(encodedEmail)
    return email ? email : null
  } catch {
    return null
  }
}

function createMockSession(email: string): AuthSession {
  return {
    accessToken: createMockToken('access', email),
    refreshToken: createMockToken('refresh', email),
  }
}

function cloneArray(value: string[] | undefined): string[] | undefined {
  return value ? [...value] : undefined
}

function cloneObject<T extends Record<string, unknown> | null | undefined>(value: T): T {
  if (!value) {
    return value
  }

  return { ...value } as T
}

function createInitialMockUser(params: {
  email: string
  firstName: string
  lastName: string
  password: string
  phone?: string
  role: MockUserRole
}): MockUser {
  if (params.role === 'Executor') {
    return {
      ...params,
      isEmailVerified: true,
      isPhoneVerified: true,
      applicantProfile: null,
      customerProfile: null,
      executorProfile: {
        employmentType: 'Smz',
        projectTitle: 'IT Recruiting',
        projectCompanyName: 'SelectProfi',
        experienceSummary: 'Подбор middle/senior кандидатов в SaaS',
        achievements: '30+ закрытых вакансий за год',
        certificates: ['HR Analytics'],
        grade: 'Senior',
      },
    }
  }

  if (params.role === 'Applicant') {
    return {
      ...params,
      isEmailVerified: true,
      isPhoneVerified: true,
      applicantProfile: {
        resumeTitle: 'Frontend Developer',
        experienceSummary: 'React / TypeScript / SaaS',
        skills: ['React', 'TypeScript', 'Tailwind CSS'],
      },
      customerProfile: null,
      executorProfile: null,
    }
  }

  return {
    ...params,
    isEmailVerified: true,
    isPhoneVerified: true,
    applicantProfile: null,
    customerProfile: {
      companyName: 'SelectProfi Demo',
    },
    executorProfile: null,
  }
}

const mockUsersByEmail = new Map<string, MockUser>([
  [
    'customer@selectprofi.local',
    createInitialMockUser({
      role: 'Customer',
      email: 'customer@selectprofi.local',
      firstName: 'Иван',
      lastName: 'Петров',
      password: '1',
      phone: '+79990000001',
    }),
  ],
  [
    'executor@selectprofi.local',
    createInitialMockUser({
      role: 'Executor',
      email: 'executor@selectprofi.local',
      firstName: 'Анна',
      lastName: 'Соколова',
      password: '1',
      phone: '+79990000002',
    }),
  ],
  [
    'applicant@selectprofi.local',
    createInitialMockUser({
      role: 'Applicant',
      email: 'applicant@selectprofi.local',
      firstName: 'Максим',
      lastName: 'Новиков',
      password: '1',
      phone: '+79990000003',
    }),
  ],
])

function toMockProfileResponse(user: MockUser) {
  return {
    userId: `mock-${user.role.toLowerCase()}-${encodeURIComponent(user.email)}`,
    email: user.email,
    phone: user.phone ?? null,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    applicantProfile: user.applicantProfile
      ? {
          ...cloneObject(user.applicantProfile),
          skills: cloneArray(user.applicantProfile.skills),
          certificates: cloneArray(user.applicantProfile.certificates),
        }
      : null,
    customerProfile: user.customerProfile ? cloneObject(user.customerProfile) : null,
    executorProfile: user.executorProfile
      ? {
          ...cloneObject(user.executorProfile),
          certificates: cloneArray(user.executorProfile.certificates),
        }
      : null,
  }
}

function createMockError(status: number, data: unknown): { error: FetchBaseQueryError } {
  return {
    error: {
      status,
      data,
    } as FetchBaseQueryError,
  }
}

function createMockData<TData>(data: TData): { data: TData } {
  return { data }
}

async function waitMockLatency() {
  await new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, mockLatencyMs)
  })
}

function readMockUserByAccessToken(state: unknown): MockUser | null {
  const session = readAuthSessionFromState(state)
  const email = readEmailFromMockToken(session?.accessToken, 'access')
  if (!email) {
    return null
  }

  return mockUsersByEmail.get(email) ?? null
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const session = readAuthSessionFromState(getState())
    if (session?.accessToken) {
      headers.set('Authorization', `Bearer ${session.accessToken}`)
    }

    return headers
  },
})

const mockBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
) => {
  await waitMockLatency()

  const url = resolveRequestUrl(args)
  const method = resolveRequestMethod(args)
  const body = resolveRequestBody(args)

  if (url === '/health' && method === 'GET') {
    return createMockData({ status: 'ok', mode: 'mock' })
  }

  if (url === '/api/auth/login' && method === 'POST') {
    const email = getStringField(body, 'email').toLowerCase()
    const password = getStringField(body, 'password')
    const user = mockUsersByEmail.get(email)

    if (!user || user.password !== password) {
      return createMockError(401, {
        title: 'Unauthorized',
        detail: 'Неверный email или пароль.',
      })
    }

    return createMockData(createMockSession(user.email))
  }

  if (url === '/api/auth/register' && method === 'POST') {
    const email = getStringField(body, 'email').toLowerCase()
    const password = getStringField(body, 'password')
    const firstName = getStringField(body, 'firstName')
    const lastName = getStringField(body, 'lastName')
    const phone = getStringField(body, 'phone')
    const roleCandidate = getStringField(body, 'role')
    const role: MockUserRole =
      roleCandidate === 'Applicant' ||
      roleCandidate === 'Executor' ||
      roleCandidate === 'Customer'
        ? roleCandidate
        : 'Customer'

    if (!email || !password || !firstName || !lastName) {
      return createMockError(400, {
        title: 'Validation error',
        detail: 'Проверьте обязательные поля формы.',
        errors: {
          email: !email ? ['Email обязателен'] : undefined,
          password: !password ? ['Пароль обязателен'] : undefined,
          firstName: !firstName ? ['Имя обязательно'] : undefined,
          lastName: !lastName ? ['Фамилия обязательна'] : undefined,
        },
      })
    }

    if (mockUsersByEmail.has(email)) {
      return createMockError(409, {
        title: 'Conflict',
        detail: 'Пользователь с таким email уже зарегистрирован.',
        errors: [{ field: 'email', message: 'Email уже зарегистрирован' }],
      })
    }

    const newUser = createInitialMockUser({
      role,
      email,
      firstName,
      lastName,
      password,
      phone: phone || undefined,
    })
    mockUsersByEmail.set(email, newUser)

    return createMockData(createMockSession(email))
  }

  if (url === '/api/auth/refresh' && method === 'POST') {
    const refreshToken = getStringField(body, 'refreshToken')
    const email = readEmailFromMockToken(refreshToken, 'refresh')
    const user = email ? mockUsersByEmail.get(email) : null

    if (!email || !user) {
      return createMockError(401, {
        title: 'Unauthorized',
        detail: 'Refresh token недействителен.',
      })
    }

    return createMockData(createMockSession(email))
  }

  if (url === '/api/profile/me' && method === 'GET') {
    const user = readMockUserByAccessToken(api.getState())

    if (!user) {
      return createMockError(401, {
        title: 'Unauthorized',
        detail: 'Требуется авторизация для выполнения действия.',
      })
    }

    return createMockData(toMockProfileResponse(user))
  }

  if (url === '/api/profile/me' && method === 'PUT') {
    const user = readMockUserByAccessToken(api.getState())

    if (!user) {
      return createMockError(401, {
        title: 'Unauthorized',
        detail: 'Требуется авторизация для выполнения действия.',
      })
    }

    if (!isRecord(body)) {
      return createMockError(400, {
        title: 'Validation error',
        detail: 'Некорректное тело запроса.',
      })
    }

    const firstName = getStringField(body, 'firstName')
    const lastName = getStringField(body, 'lastName')
    const phoneValue = body.phone

    if (firstName) {
      user.firstName = firstName
    }
    if (lastName) {
      user.lastName = lastName
    }
    if (typeof phoneValue === 'string') {
      user.phone = phoneValue.trim() || undefined
    }

    if (body.applicantProfile === null || isRecord(body.applicantProfile)) {
      user.applicantProfile = (body.applicantProfile as MockApplicantProfile | null | undefined) ?? null
    }

    if (body.customerProfile === null || isRecord(body.customerProfile)) {
      user.customerProfile = (body.customerProfile as MockCustomerProfile | null | undefined) ?? null
    }

    if (body.executorProfile === null || isRecord(body.executorProfile)) {
      user.executorProfile = (body.executorProfile as MockExecutorProfile | null | undefined) ?? null
    }

    return createMockData(toMockProfileResponse(user))
  }

  return createMockError(404, {
    title: 'Not Found',
    detail: `Mock endpoint not found: ${method} ${url}`,
  })
}

let refreshPromise: Promise<AuthSession | null> | null = null

export const apiDispatcher: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  if (apiMode === 'mock') {
    return mockBaseQuery(args, api, extraOptions)
  }

  let result = await rawBaseQuery(args, api, extraOptions)

  if (!isUnauthorized(result.error) || isRefreshRequest(args)) {
    if (isUnauthorized(result.error) && isRefreshRequest(args)) {
      api.dispatch(clearAuthSession())
    }

    return result
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const session = readAuthSessionFromState(api.getState())
      if (!session?.refreshToken) {
        api.dispatch(clearAuthSession())
        return null
      }

      const refreshResult = await rawBaseQuery(
        {
          url: '/api/auth/refresh',
          method: 'POST',
          body: { refreshToken: session.refreshToken },
        },
        api,
        extraOptions,
      )

      if (isAuthSession(refreshResult.data)) {
        api.dispatch(setAuthSession(refreshResult.data))
        return refreshResult.data
      }

      api.dispatch(clearAuthSession())
      return null
    })().finally(() => {
      refreshPromise = null
    })
  }

  const refreshedSession = await refreshPromise
  if (!refreshedSession) {
    return result
  }

  result = await rawBaseQuery(args, api, extraOptions)
  return result
}
