import { useDispatch } from 'react-redux'
import { setAuthSession, type AuthSession } from '@/app/authSessionSlice'
import { api } from '@/shared/api/generated/openapi'
import {
  isFetchBaseQueryError,
  type LoginUserRequest,
  type RegisterUserRequest,
  useLoginUserMutation,
  useRegisterUserMutation,
} from '@/shared/api/auth'

function createDemoSession(): AuthSession {
  return {
    accessToken: `demo-access-token-${Date.now()}`,
    refreshToken: `demo-refresh-token-${Date.now()}`,
  }
}

export function useLoginUseCase() {
  const dispatch = useDispatch()
  const [loginUser, { isLoading }] = useLoginUserMutation()

  async function executeLogin(payload: LoginUserRequest): Promise<AuthSession> {
    const session = await loginUser(payload).unwrap()
    // @dvnull: Ранее при входе под другим пользователем сохранялся cache предыдущей сессии; добавлен reset API state перед установкой новых токенов.
    dispatch(api.util.resetApiState())
    dispatch(setAuthSession(session))
    return session
  }

  function executeDemoLogin(): AuthSession {
    const session = createDemoSession()
    // @dvnull: Ранее demo-login не сбрасывал query-cache и мог показывать предыдущего пользователя до обновления страницы.
    dispatch(api.util.resetApiState())
    dispatch(setAuthSession(session))
    return session
  }

  return {
    executeLogin,
    executeDemoLogin,
    isApiError: isFetchBaseQueryError,
    isLoading,
  }
}

export function useRegisterUseCase() {
  const dispatch = useDispatch()
  const [registerUser, { isLoading }] = useRegisterUserMutation()

  async function executeRegister(payload: RegisterUserRequest): Promise<AuthSession> {
    const session = await registerUser(payload).unwrap()
    // @dvnull: Ранее после регистрации мог оставаться cache старого аккаунта; сбрасываем API state перед новой сессией.
    dispatch(api.util.resetApiState())
    dispatch(setAuthSession(session))
    return session
  }

  function executeDemoRegistration(): AuthSession {
    const session = createDemoSession()
    // @dvnull: Ранее demo-registration переиспользовал старый query-cache между пользователями.
    dispatch(api.util.resetApiState())
    dispatch(setAuthSession(session))
    return session
  }

  return {
    executeDemoRegistration,
    executeRegister,
    isApiError: isFetchBaseQueryError,
    isLoading,
  }
}
