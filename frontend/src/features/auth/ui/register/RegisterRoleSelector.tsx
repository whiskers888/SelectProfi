import type { RegisterUserRole } from '@/shared/api/auth'
import { registrationRoleOptions } from '@/features/auth/constants'
import type { RegistrationFormErrors } from '@/features/auth/types'
import { FormFieldError } from '@/components/ui/form-feedback'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Props = {
  registrationRole: RegisterUserRole
  errors: RegistrationFormErrors
  onRoleChange: (nextRole: string) => void
}

export function RegisterRoleSelector({ registrationRole, errors, onRoleChange }: Props) {
  return (
    <div className="space-y-2">
      {/* @dvnull: Блок выбора роли вынесен из RegisterPage без изменения desktop/mobile UX и валидационных aria-связок. */}
      <Label className="text-slate-600">Роль</Label>

      <div className="md:hidden">
        <Select name="role" value={registrationRole} onValueChange={onRoleChange}>
          <SelectTrigger
            aria-label="Роль"
            aria-invalid={Boolean(errors.role)}
            aria-describedby={errors.role ? 'register-role-error' : undefined}
            className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 focus:ring-blue-600/30"
          >
            <SelectValue placeholder="Выберите роль" />
          </SelectTrigger>
          <SelectContent>
            {registrationRoleOptions.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block">
        <Tabs value={registrationRole} onValueChange={onRoleChange}>
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-slate-100 p-1">
            {registrationRoleOptions.map((role) => (
              <TabsTrigger
                key={role.value}
                value={role.value}
                className="h-9 rounded-lg px-2 text-xs text-slate-600 transition-colors data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                {role.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <p className="text-xs text-slate-500">
        {registrationRoleOptions.find((role) => role.value === registrationRole)?.description}
      </p>
      <FormFieldError id="register-role-error">{errors.role}</FormFieldError>
    </div>
  )
}
