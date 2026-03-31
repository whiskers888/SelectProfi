import { useDispatch } from 'react-redux'
import { setAuthSession, type AuthSession } from '@/app/authSessionSlice'
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
    dispatch(setAuthSession(session))
    return session
  }

  function executeDemoLogin(): AuthSession {
    const session = createDemoSession()
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
    dispatch(setAuthSession(session))
    return session
  }

  function executeDemoRegistration(): AuthSession {
    const session = createDemoSession()
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
