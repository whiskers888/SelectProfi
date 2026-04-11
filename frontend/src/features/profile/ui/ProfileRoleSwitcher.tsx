import type { UserRole } from '@/features/profile/model'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormStatusMessage } from '@/components/ui/form-feedback'

type RoleSwitchMessageState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

type SwitchableRole = Extract<UserRole, 'Applicant' | 'Executor'>

type Props = {
  activeRole: SwitchableRole
  isRoleSwitchDisabled: boolean
  roleSwitchMessage: RoleSwitchMessageState
  onSwitchRole: (nextRole: SwitchableRole) => void
}

export function ProfileRoleSwitcher({
  activeRole,
  isRoleSwitchDisabled,
  roleSwitchMessage,
  onSwitchRole,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Активная роль</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* @dvnull: Inline-блок переключения роли вынесен из ProfilePage без изменения условий disabled и статусов. */}
        {roleSwitchMessage.status !== 'idle' ? (
          <FormStatusMessage
            message={roleSwitchMessage.message}
            status={roleSwitchMessage.status === 'error' ? 'error' : 'success'}
          />
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => onSwitchRole('Applicant')}
            variant={activeRole === 'Applicant' ? 'default' : 'outline'}
            disabled={isRoleSwitchDisabled || activeRole === 'Applicant'}
          >
            Соискатель
          </Button>
          <Button
            type="button"
            onClick={() => onSwitchRole('Executor')}
            variant={activeRole === 'Executor' ? 'default' : 'outline'}
            disabled={isRoleSwitchDisabled || activeRole === 'Executor'}
          >
            Исполнитель
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
