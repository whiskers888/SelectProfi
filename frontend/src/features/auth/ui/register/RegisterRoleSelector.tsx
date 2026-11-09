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
      <Label className="text-muted-foreground">Роль</Label>

      <div className="md:hidden">
        <Select name="role" value={registrationRole} onValueChange={onRoleChange}>
          <SelectTrigger
            aria-label="Роль"
            aria-invalid={Boolean(errors.role)}
            aria-describedby={errors.role ? 'register-role-error' : undefined}
            className="h-11 rounded-xl border-border bg-card text-foreground focus:ring-ring/40"
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
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-muted p-1">
            {registrationRoleOptions.map((role) => (
              <TabsTrigger
                key={role.value}
                value={role.value}
                className="h-9 rounded-lg px-2 text-xs text-muted-foreground transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                {role.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <p className="text-xs text-muted-foreground">
        {registrationRoleOptions.find((role) => role.value === registrationRole)?.description}
      </p>
      <FormFieldError id="register-role-error">{errors.role}</FormFieldError>
    </div>
  )
}
