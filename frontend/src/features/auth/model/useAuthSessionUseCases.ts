import { useDispatch } from 'react-redux'
import { setAuthSession, type AuthSession } from '@/app/authSessionSlice'
import { api } from '@/shared/api/generated/openapi'
import {
  isFetchBaseQueryError,
  type ConfirmVerificationCodeRequest,
  type ConfirmVerificationCodeResponse,
  type LoginUserRequest,
  type RegisterUserRequest,
  type SendVerificationCodeRequest,
  type SendVerificationCodeResponse,
  useConfirmVerificationCodeMutation,
  useLoginUserMutation,
  useRegisterUserMutation,
  useSendVerificationCodeMutation,
} from '@/shared/api/auth'

export function useLoginUseCase() {
  const dispatch = useDispatch()
  const [loginUser, { isLoading }] = useLoginUserMutation()

  async function executeLogin(payload: LoginUserRequest): Promise<AuthSession> {
    const session = await loginUser(payload).unwrap()
    dispatch(api.util.resetApiState())
    dispatch(setAuthSession(session))
    return session
  }

  return {
    executeLogin,
    isApiError: isFetchBaseQueryError,
    isLoading,
  }
}

export function useRegisterUseCase() {
  const dispatch = useDispatch()
  const [registerUser, { isLoading }] = useRegisterUserMutation()

  async function executeRegister(payload: RegisterUserRequest): Promise<AuthSession> {
    const session = await registerUser(payload).unwrap()
    dispatch(api.util.resetApiState())
    dispatch(setAuthSession(session))
    return session
  }

  return {
    executeRegister,
    isApiError: isFetchBaseQueryError,
    isLoading,
  }
}

export function useVerificationUseCases() {
  const [sendCode, sendState] = useSendVerificationCodeMutation()
  const [confirmCode, confirmState] = useConfirmVerificationCodeMutation()

  async function sendVerification(
    payload: SendVerificationCodeRequest,
  ): Promise<SendVerificationCodeResponse> {
    return sendCode(payload).unwrap()
  }

  async function confirmVerification(
    payload: ConfirmVerificationCodeRequest,
  ): Promise<ConfirmVerificationCodeResponse> {
    return confirmCode(payload).unwrap()
  }

  return {
    sendVerification,
    confirmVerification,
    isSending: sendState.isLoading,
    isConfirming: confirmState.isLoading,
    isApiError: isFetchBaseQueryError,
  }
}
