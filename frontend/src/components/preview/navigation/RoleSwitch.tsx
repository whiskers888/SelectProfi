import { previewRoleOptions, type PreviewRole } from '../model/data'

type RoleSwitchProps = {
  role: PreviewRole
  onRoleChange: (role: PreviewRole) => void
}

export function RoleSwitch({ onRoleChange, role }: RoleSwitchProps) {
  const activeRole = previewRoleOptions.find((option) => option.value === role)

  // @dvnull: Ранее переключатель ролей был на Tabs с blue-стилями, заменен на HTML-паттерн role-val.
  return (
    <div className="preview11-role-switch">
      <div className="preview11-role-options" role="tablist" aria-label="Роли интерфейса">
        {previewRoleOptions.map((roleOption) => (
          <button
            key={roleOption.value}
            aria-selected={roleOption.value === role}
            className={`preview11-role-option${roleOption.value === role ? ' preview11-role-option-active' : ''}`}
            onClick={() => onRoleChange(roleOption.value)}
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
