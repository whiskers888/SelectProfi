import { workspaceRoleOptions, type WorkspaceRole } from '../model/data'

type RoleSwitchProps = {
  role: WorkspaceRole
  roles?: WorkspaceRole[]
  disabled?: boolean
  onRoleChange: (role: WorkspaceRole) => void
}

export function RoleSwitch({ onRoleChange, role, roles, disabled = false }: RoleSwitchProps) {
  const roleOptions = roles
    ? workspaceRoleOptions.filter((option) => roles.includes(option.value))
    : workspaceRoleOptions
  const activeRole = roleOptions.find((option) => option.value === role)

  // @dvnull: Ранее переключатель ролей был на Tabs с blue-стилями, заменен на HTML-паттерн role-val.
  return (
    <div className="preview11-role-switch">
      <div className="preview11-role-options" role="tablist" aria-label="Роли интерфейса">
        {roleOptions.map((roleOption) => (
          <button
            key={roleOption.value}
            aria-selected={roleOption.value === role}
            className={`preview11-role-option${roleOption.value === role ? ' preview11-role-option-active' : ''}`}
            onClick={() => onRoleChange(roleOption.value)}
            disabled={disabled}
            role="tab"
            type="button"
          >
            {roleOption.label}
          </button>
        ))}
      </div>
      <p className="preview11-role-description">{activeRole?.description}</p>
    </div>
  )
}
